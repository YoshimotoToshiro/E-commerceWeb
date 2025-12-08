import { useState } from 'react';
import BackButton from '../../components/common/BackButton';

export default function Statistics() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Thống kê</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Tính năng đang phát triển...</p>
      </div>
    </div>
  );
}

