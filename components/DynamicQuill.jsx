'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px] bg-white/5 rounded-lg flex items-center justify-center">
    <span className="text-gray-400">Loading editor...</span>
  </div>
});

export default function DynamicQuill({ value, onChange, readOnly = false, className = '' }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-[400px] bg-white/5 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="bg-transparent" style={{ position: 'relative', zIndex: 1 }}>
      <ReactQuill
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={className}
        modules={{
          toolbar: readOnly ? false : [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'list', 'bullet',
          'link', 'image'
        ]}
        theme="snow"
      />
    </div>
  );
}
