/**
 * TensorFlow.js 草药识别模型
 * 支持推理、浏览器端微调训练和模型持久化
 */
import * as tf from '@tensorflow/tfjs';
import { herbDatabase } from '../data/herbDatabase';

export interface ModelPrediction {
  herbId: string;
  herbName: string;
  confidence: number;
  features: number[];
}

export interface ModelMetrics {
  accuracy: number;
  processingTime: number;
  memoryUsage: number;
  predictions: ModelPrediction[];
}

export interface TrainingSampleInput {
  herbId: string;
  imageData: string;
}

export interface TrainOptions {
  epochs?: number;
  batchSize?: number;
  validationSplit?: number;
  learningRate?: number;
}

export interface TrainProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
}

const MODEL_STORE_KEY = 'indexeddb://herb-recognition-model';

class HerbRecognitionModel {
  private model: tf.LayersModel | null = null;
  private isLoaded = false;
  private classNames: string[] = [];

  constructor() {
    this.initializeClassNames();
  }

  private initializeClassNames() {
    this.classNames = herbDatabase.map((herb) => herb.name);
  }

  private getClassIndexByHerbId(herbId: string) {
    return herbDatabase.findIndex((herb) => herb.id === herbId);
  }

  private async imageDataToTensor(imageData: string): Promise<tf.Tensor3D> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const tensor = tf.tidy(() => {
            const raw = tf.browser.fromPixels(img);
            const resized = tf.image.resizeBilinear(raw, [224, 224]);
            return resized.div(255) as tf.Tensor3D;
          });
          resolve(tensor);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('图片解析失败'));
      img.src = imageData;
    });
  }

  async loadModel(): Promise<boolean> {
    try {
      this.initializeClassNames();
      const loaded = await this.loadSavedModel();
      if (loaded) {
        return true;
      }

      this.model = this.createBaseModel();
      this.isLoaded = true;
      console.log('草药识别模型初始化成功（基础模型）');
      return true;
    } catch (error) {
      console.error('模型加载失败:', error);
      return false;
    }
  }

  private createBaseModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.globalAveragePooling2d(),
        tf.layers.dense({
          units: 256,
          activation: 'relu',
        }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({
          units: this.classNames.length,
          activation: 'softmax',
        }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private ensureModelReady() {
    if (!this.model || !this.isLoaded) {
      throw new Error('模型未加载');
    }
  }

  private preprocessImage(imageElement: HTMLImageElement): tf.Tensor {
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageElement);
      const resized = tf.image.resizeBilinear(tensor, [224, 224]);
      const normalized = resized.div(255.0);
      return normalized.expandDims(0);
    });
  }

  async trainWithSamples(
    samples: TrainingSampleInput[],
    options: TrainOptions = {},
    onProgress?: (progress: TrainProgress) => void,
  ): Promise<{ finalLoss: number; finalAccuracy: number }> {
    this.ensureModelReady();

    if (!samples.length) {
      throw new Error('训练数据为空');
    }

    const validSamples = samples.filter((sample) => this.getClassIndexByHerbId(sample.herbId) >= 0);
    if (!validSamples.length) {
      throw new Error('训练数据标签与草药类别不匹配');
    }

    const epochs = options.epochs ?? 5;
    const batchSize = options.batchSize ?? 8;
    const validationSplit = options.validationSplit ?? 0.2;
    const learningRate = options.learningRate ?? 0.0005;

    this.model!.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    const imageTensors: tf.Tensor3D[] = [];
    const labels: number[] = [];

    try {
      for (const sample of validSamples) {
        const classIndex = this.getClassIndexByHerbId(sample.herbId);
        if (classIndex < 0) continue;
        const tensor = await this.imageDataToTensor(sample.imageData);
        imageTensors.push(tensor);
        labels.push(classIndex);
      }

      if (!imageTensors.length) {
        throw new Error('未能从训练样本中提取有效图像');
      }

      const xs = tf.stack(imageTensors) as tf.Tensor4D;
      const labelTensor = tf.tensor1d(labels, 'int32');
      const ys = tf.oneHot(labelTensor, this.classNames.length);
      labelTensor.dispose();

      const history = await this.model!.fit(xs, ys, {
        epochs,
        batchSize,
        validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            onProgress?.({
              epoch: epoch + 1,
              totalEpochs: epochs,
              loss: Number(logs?.loss ?? 0),
              accuracy: Number(logs?.acc ?? logs?.accuracy ?? 0),
            });
          },
        },
      });

      const losses = history.history.loss as number[];
      const accs = (history.history.acc ?? history.history.accuracy ?? []) as number[];

      const finalLoss = losses.length ? Number(losses[losses.length - 1]) : 0;
      const finalAccuracy = accs.length ? Number(accs[accs.length - 1]) : 0;

      xs.dispose();
      ys.dispose();

      return { finalLoss, finalAccuracy };
    } finally {
      imageTensors.forEach((tensor) => tensor.dispose());
    }
  }

  async saveModel(): Promise<void> {
    this.ensureModelReady();
    await this.model!.save(MODEL_STORE_KEY);
  }

  async loadSavedModel(): Promise<boolean> {
    try {
      const loadedModel = await tf.loadLayersModel(MODEL_STORE_KEY);
      loadedModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });
      this.model = loadedModel;
      this.isLoaded = true;
      console.log('已从浏览器缓存加载训练模型');
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeSavedModel(): Promise<void> {
    try {
      await tf.io.removeModel(MODEL_STORE_KEY);
    } catch (error) {
      // ignore: 当不存在缓存模型时无需抛错
    }
  }

  applyDataAugmentation(imageElement: HTMLImageElement): Promise<HTMLCanvasElement[]> {
    return new Promise((resolve, reject) => {
      try {
        const augmentedImages: HTMLCanvasElement[] = [];

        const originalCanvas = document.createElement('canvas');
        const originalCtx = originalCanvas.getContext('2d');
        if (!originalCtx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }
        originalCanvas.width = 224;
        originalCanvas.height = 224;
        originalCtx.drawImage(imageElement, 0, 0, 224, 224);
        augmentedImages.push(originalCanvas);

        const flippedCanvas = document.createElement('canvas');
        const flippedCtx = flippedCanvas.getContext('2d');
        if (!flippedCtx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }
        flippedCanvas.width = 224;
        flippedCanvas.height = 224;
        flippedCtx.scale(-1, 1);
        flippedCtx.drawImage(imageElement, -224, 0, 224, 224);
        augmentedImages.push(flippedCanvas);

        const rotatedCanvas = document.createElement('canvas');
        const rotatedCtx = rotatedCanvas.getContext('2d');
        if (!rotatedCtx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }
        rotatedCanvas.width = 224;
        rotatedCanvas.height = 224;
        rotatedCtx.translate(112, 112);
        rotatedCtx.rotate(Math.PI / 12);
        rotatedCtx.drawImage(imageElement, -112, -112, 224, 224);
        augmentedImages.push(rotatedCanvas);

        const brighterCanvas = document.createElement('canvas');
        const brighterCtx = brighterCanvas.getContext('2d');
        if (!brighterCtx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }
        brighterCanvas.width = 224;
        brighterCanvas.height = 224;
        brighterCtx.filter = 'brightness(1.2)';
        brighterCtx.drawImage(imageElement, 0, 0, 224, 224);
        augmentedImages.push(brighterCanvas);

        resolve(augmentedImages);
      } catch (error) {
        reject(error);
      }
    });
  }

  async predict(imageElement: HTMLImageElement): Promise<ModelMetrics> {
    this.ensureModelReady();

    const startTime = performance.now();

    try {
      return tf.tidy(() => {
        const preprocessed = this.preprocessImage(imageElement);
        const predictions = this.model!.predict(preprocessed) as tf.Tensor;
        const predictionData = predictions.dataSync() as Float32Array;

        const memoryInfo = tf.memory();

        const results: ModelPrediction[] = [];
        for (let i = 0; i < Math.min(this.classNames.length, herbDatabase.length); i++) {
          const herb = herbDatabase[i];
          if (herb) {
            results.push({
              herbId: herb.id,
              herbName: herb.name,
              confidence: predictionData[i] ?? 0,
              features: Array.from(predictionData.slice(0, 10)),
            });
          }
        }

        results.sort((a, b) => b.confidence - a.confidence);

        const processingTime = performance.now() - startTime;

        return {
          accuracy: Math.max(...results.map((r) => r.confidence), 0),
          processingTime,
          memoryUsage: memoryInfo.numBytes,
          predictions: results,
        };
      });
    } catch (error) {
      console.error('预测过程出错:', error);
      throw error;
    }
  }

  getModelInfo() {
    if (!this.model) return null;

    try {
      return {
        inputShape: this.model.inputs[0].shape,
        outputShape: this.model.outputs[0].shape,
        trainableParams: this.model.countParams(),
        layers: this.model.layers.length,
      };
    } catch (error) {
      console.error('获取模型信息时出错:', error);
      return null;
    }
  }

  dispose() {
    try {
      if (this.model) {
        this.model.dispose();
        this.model = null;
        this.isLoaded = false;
      }
    } catch (error) {
      console.error('清理资源时出错:', error);
    }
  }
}

export const herbRecognitionModel = new HerbRecognitionModel();
