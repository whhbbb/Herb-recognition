import React, { useEffect } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

const Test: React.FC = () => {
  useEffect(() => {
    const xs = [1, 2, 3, 4, 5];
    const ys = [1, 3, 5, 7, 9];

    tfvis.render.scatterplot(
      { name: '测试数据点' },
      { values: xs.map((x, i) => ({ x, y: ys[i] })), series: ['数据点'] },
      {
        xLabel: 'X轴',
        yLabel: 'Y轴',
        height: 300,
        width: 400,
      }
    );

    // 创建一个简单的线性模型
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1]}))

    // 添加损失函数 & 优化器
    model.compile({ loss: tf.losses.meanSquaredError, optimizer: tf.train.sgd(0.1) });

    // 将数据转换为张量
    const xsTensor = tf.tensor(xs);
    const ysTensor = tf.tensor(ys);

    // 训练模型
    model.fit(xsTensor, ysTensor, {
      batchSize: 1,
      epochs: 100,
      callbacks: tfvis.show.fitCallbacks({
        name: '训练过程',
        tab: '训练',
      }, ['loss'], {
        height: 200,
        width: 400,
      })
    }).then(() => {
      console.log('模型训练完成');
      // 使用模型进行预测
      const inputTensor = tf.tensor([6]);
      const prediction = model.predict(inputTensor) as tf.Tensor;
      prediction.print();
    }).catch(error => {
      console.error('模型训练出错:', error);
    });
    
    // 预测输出
    const output = model.predict(tf.tensor([6])) as tf.Tensor;
    output.print();
  },[])

  return (
    <div className="test-page">
      <h1>测试页面</h1>
      <p>这是一个测试页面，您可以在这里进行各种测试。</p>
      <p>请注意，这个页面目前没有实际功能。</p>
    </div>
  );
};

export default Test;