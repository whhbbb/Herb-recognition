import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Brain, Database, Play, RefreshCw, Server, Trash2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentPageAtom } from '../../store/atoms';
import { herbDatabase } from '../../data/herbDatabase';
 
interface ApiSample {
  id: string;
  herbId: string;
  herbName: string;
  fileUrl: string;
  source: 'manual' | 'dataset';
  split: 'train' | 'val' | 'test';
  createdAt: string;
}

interface ApiSamplesResponse {
  items: ApiSample[];
  total: number;
  page: number;
  pageSize: number;
}

interface ApiTrainingJob {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  datasetSize: number;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  log: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

const getApiBaseUrl = () => {
  const fromLocalStorage = window.localStorage.getItem('herbApiBaseUrl');
  return fromLocalStorage || 'http://127.0.0.1:4000/api';
};

const Test: React.FC = () => {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [apiBaseUrl, setApiBaseUrl] = useState(getApiBaseUrl());
  const [selectedHerbId, setSelectedHerbId] = useState(herbDatabase[0]?.id ?? '1');
  const [epochs, setEpochs] = useState(5);
  const [batchSize, setBatchSize] = useState(8);
  const [validationSplit, setValidationSplit] = useState(0.2);
  const [split, setSplit] = useState<'train' | 'val' | 'test'>('train');
  const [samples, setSamples] = useState<ApiSample[]>([]);
  const [samplesTotal, setSamplesTotal] = useState(0);
  const [jobs, setJobs] = useState<ApiTrainingJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [loading, setLoading] = useState(false);

  const sampleStats = useMemo<{ herbId: string; herbName: string; count: number }[]>(() => {
    const map = new Map<string, number>();
    for (const herb of herbDatabase) {
      map.set(herb.id, 0);
    }

    for (const sample of samples) {
      map.set(sample.herbId, (map.get(sample.herbId) ?? 0) + 1);
    }

    return herbDatabase.map((herb) => ({
      herbId: herb.id,
      herbName: herb.name,
      count: map.get(herb.id) ?? 0,
    }));
  }, [samples]);

  const selectedHerb = useMemo(() => herbDatabase.find((h) => h.id === selectedHerbId), [selectedHerbId]);

  const uploadOneFile = async (file: File, herbId: string, herbName: string, source: 'manual' | 'dataset') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('herbId', herbId);
    formData.append('herbName', herbName);
    formData.append('source', source);
    formData.append('split', split);

    const response = await fetch(`${apiBaseUrl}/samples/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || '上传失败');
    }
    return response.json();
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [samplesResp, jobsResp] = await Promise.all([
        fetch(`${apiBaseUrl}/samples?page=1&pageSize=500`),
        fetch(`${apiBaseUrl}/training/jobs`),
      ]);

      if (!samplesResp.ok || !jobsResp.ok) {
        throw new Error('获取服务端数据失败');
      }

      const samplesData = (await samplesResp.json()) as ApiSamplesResponse;
      const jobsData = (await jobsResp.json()) as ApiTrainingJob[];
      setSamples(samplesData.items);
      setSamplesTotal(samplesData.total);
      setJobs(jobsData);
    } catch (error) {
      console.error(error);
      toast.error('无法连接训练服务器，请检查 API 地址或后端状态');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [apiBaseUrl]);

  const handleAddSamples = async (files: FileList | null) => {
    if (!files?.length) return;

    if (!selectedHerb) {
      toast.error('请先选择药材类别');
      return;
    }

    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!validFiles.length) {
      toast.error('请上传图片文件');
      return;
    }

    setUploading(true);
    try {
      for (const file of validFiles) {
        await uploadOneFile(file, selectedHerb.id, selectedHerb.name, 'manual');
      }
      toast.success(`已上传 ${validFiles.length} 张「${selectedHerb.name}」训练样本`);
      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('样本上传失败');
    } finally {
      setUploading(false);
    }
  };

  const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '');

  const matchHerbByFolderName = (folderName: string) => {
    const normalizedFolder = normalizeName(folderName);
    return herbDatabase.find((herb) => {
      const candidates = [herb.name, herb.scientificName];
      return candidates.some((name) => {
        const normalizedName = normalizeName(name);
        return (
          normalizedName === normalizedFolder ||
          normalizedName.includes(normalizedFolder) ||
          normalizedFolder.includes(normalizedName)
        );
      });
    });
  };

  const handleImportFolderDataset = async (files: FileList | null) => {
    if (!files?.length) return;

    const grouped = new Map<string, File[]>();
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const parts = file.webkitRelativePath?.split('/').filter(Boolean) ?? [];
      const folderName = parts.length >= 2 ? parts[parts.length - 2] : '';
      if (!folderName) continue;
      if (!grouped.has(folderName)) grouped.set(folderName, []);
      grouped.get(folderName)!.push(file);
    }

    if (!grouped.size) {
      toast.error('未识别到有效的目录结构，请使用“类别文件夹/图片文件”格式');
      return;
    }

    setUploading(true);
    let uploadedCount = 0;
    const unmatchedFolders: string[] = [];

    try {
      for (const [folderName, folderFiles] of grouped.entries()) {
        const herb = matchHerbByFolderName(folderName);
        if (!herb) {
          unmatchedFolders.push(folderName);
          continue;
        }

        for (const file of folderFiles) {
          await uploadOneFile(file, herb.id, herb.name, 'dataset');
          uploadedCount += 1;
        }
      }

      if (uploadedCount > 0) {
        toast.success(`目录导入完成，新增 ${uploadedCount} 张训练样本`);
      }
      if (unmatchedFolders.length) {
        toast.error(`以下目录未匹配到已知类别：${unmatchedFolders.join('、')}`);
      }
      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('目录导入失败');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTrainingJob = async () => {
    if (samplesTotal < 8) {
      toast.error('训练样本过少，建议至少 8 张图片');
      return;
    }

    setCreatingJob(true);
    try {
      const response = await fetch(`${apiBaseUrl}/training/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          epochs,
          batchSize,
          validationSplit,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '创建训练任务失败');
      }
      toast.success('训练任务已提交到服务器');
      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('创建训练任务失败');
    } finally {
      setCreatingJob(false);
    }
  };

  const handleDeleteSample = async (id: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/samples/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      toast.success('样本已删除');
      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('删除样本失败');
    }
  };

  const saveApiBaseUrl = () => {
    window.localStorage.setItem('herbApiBaseUrl', apiBaseUrl);
    toast.success('训练服务器地址已保存');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="ml-3 text-xl font-semibold text-gray-800">模型训练工作台</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Server className="w-4 h-4 mr-1" />
            服务端模式
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            训练 API 配置
          </h2>
          <div className="flex gap-2">
            <input
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:4000/api"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              onClick={saveApiBaseUrl}
              className="bg-indigo-600 text-white rounded-lg px-3 py-2 hover:bg-indigo-700"
            >
              保存
            </button>
            <button
              onClick={refreshData}
              disabled={loading}
              className="bg-gray-100 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-200 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              训练数据导入
            </h2>

            <label className="block text-sm text-gray-600 mb-2">药材类别</label>
            <select
              value={selectedHerbId}
              onChange={(e) => setSelectedHerbId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
            >
              {herbDatabase.map((herb) => (
                <option key={herb.id} value={herb.id}>
                  {herb.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleAddSamples(e.target.files)}
              className="w-full text-sm"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-2">支持多选上传；每次上传会按当前类别打标。</p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImportFolderDataset(e.target.files)}
              className="w-full text-sm mt-3"
              {...({ webkitdirectory: 'true', directory: 'true' } as any)}
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-2">
              目录导入：选择根目录，按“类别名文件夹/图片”批量导入。
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3">训练参数</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Epoch</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Batch Size</label>
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Validation Split</label>
                <input
                  type="number"
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  value={validationSplit}
                  onChange={(e) => setValidationSplit(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreateTrainingJob}
                disabled={creatingJob}
                className="flex-1 bg-indigo-600 text-white rounded-lg px-3 py-2 hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-1" />
                {creatingJob ? '提交中...' : '提交训练任务'}
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>服务端样本总数：{samplesTotal}</p>
              <p>任务数量：{jobs.length}</p>
              <p>上传状态：{uploading ? '上传中' : '空闲'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-3">类别样本分布</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sampleStats.map((item) => (
              <div key={item.herbId} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-700">{item.herbName}</p>
                <p className="text-lg font-bold text-indigo-600">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mt-4">
          <h2 className="font-semibold text-gray-800 mb-3">最近训练样本</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {samples.slice(0, 20).map((sample) => (
              <div key={sample.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={sample.fileUrl} alt={sample.herbName} className="w-10 h-10 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{sample.herbName}</p>
                    <p className="text-xs text-gray-500">
                      {sample.source} / {sample.split}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSample(sample.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="删除样本"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {samples.length === 0 && <p className="text-sm text-gray-500">暂无样本</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mt-4">
          <h2 className="font-semibold text-gray-800 mb-3">训练任务状态</h2>
          <div className="space-y-2">
            {jobs.slice(0, 10).map((job) => (
              <div key={job.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{job.id.slice(0, 8)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      job.status === 'succeeded'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : job.status === 'running'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  样本: {job.datasetSize} | epoch: {job.epochs} | batch: {job.batchSize}
                </p>
                {job.log && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.log}</p>}
              </div>
            ))}
            {jobs.length === 0 && <p className="text-sm text-gray-500">暂无训练任务</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
