import React, { useState, useEffect } from 'react';
import { KTIcon } from '../../../helpers';
import clsx from 'clsx';

const NetworkIndicator: React.FC = () => {
  const [latency, setLatency] = useState<number>(0);
  const [status, setStatus] = useState<'good' | 'average' | 'poor' | 'offline'>('good');

  useEffect(() => {
    let isMounted = true;
    const measureLatency = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';
        const start = performance.now();
        const response = await fetch(`${apiUrl}/ping`, { cache: 'no-store' });
        const end = performance.now();
        
        if (response.ok && isMounted) {
          const ms = Math.round(end - start);
          setLatency(ms);
          if (ms < 150) setStatus('good');
          else if (ms < 400) setStatus('average');
          else setStatus('poor');
        } else if (isMounted) {
          setStatus('offline');
          setLatency(0);
        }
      } catch (error) {
        if (isMounted) {
          setStatus('offline');
          setLatency(0);
        }
      }
    };

    measureLatency();
    const intervalId = setInterval(measureLatency, 5000); // Ping every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  let colorClass = 'text-success';
  if (status === 'average') colorClass = 'text-warning';
  if (status === 'poor') colorClass = 'text-danger';
  if (status === 'offline') colorClass = 'text-muted';

  return (
    <div className="d-flex align-items-center px-3" title="Network Latency">
      <KTIcon iconName="wifi" className={clsx('fs-3 me-2', colorClass)} />
      <span className={clsx('fw-bolder fs-7', colorClass)}>
        {status === 'offline' ? 'Offline' : `${latency} ms`}
      </span>
    </div>
  );
};

export { NetworkIndicator };
