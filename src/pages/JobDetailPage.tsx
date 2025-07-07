import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/supabase';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      if (!jobId) {
        setError('Geçersiz iş ilanı ID');
        setLoading(false);
        return;
      }
      const { data, error } = await db.getJobPosting(jobId);
      if (error) setError(error.message);
      else setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!job) return <div className="p-8 text-center">İş ilanı bulunamadı.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <div className="text-gray-600 mb-2">{job.company?.name} - {job.city}</div>
      <div className="mb-4">Kategori: {job.category?.name}</div>
      <div className="mb-4">{job.description}</div>
      <div className="mb-2">Tip: {job.job_type}</div>
      <div className="mb-2">Maaş: {job.salary_min} - {job.salary_max} TL</div>
      <div className="mb-2">Yayınlanma: {new Date(job.created_at).toLocaleDateString()}</div>
      <div className="mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Başvur</button>
      </div>
    </div>
  );
};

export default JobDetailPage; 