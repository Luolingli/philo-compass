import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

export function EChart({ option, height = 300 }: { option: EChartsOption; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const optKey = JSON.stringify(option);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    chart.setOption(JSON.parse(optKey));
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optKey]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
