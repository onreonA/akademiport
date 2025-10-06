'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

import { ChartData } from '@/lib/analytics-service';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
interface DashboardChartsProps {
  chartData: ChartData;
  isLoading?: boolean;
}
export default function DashboardCharts({
  chartData,
  isLoading = false,
}: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse'
          >
            <div className='w-full h-64 bg-gray-200 rounded'></div>
          </div>
        ))}
      </div>
    );
  }
  const lineChartData = {
    labels: chartData?.monthlyTrends?.labels || [],
    datasets: [
      {
        label: 'Randevu Sayısı',
        data: chartData?.monthlyTrends?.data || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };
  const pieChartData = {
    labels: chartData?.statusDistribution?.labels || [],
    datasets: [
      {
        data: chartData?.statusDistribution?.data || [],
        backgroundColor: chartData?.statusDistribution?.colors || [],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
      },
    ],
  };
  const barChartData = {
    labels: chartData?.consultantPerformance?.labels || [],
    datasets: [
      {
        label: 'Tamamlanma Oranı (%)',
        data: chartData?.consultantPerformance?.data || [],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };
  const doughnutChartData = {
    labels: chartData?.meetingTypeDistribution?.labels || [],
    datasets: [
      {
        data: chartData?.meetingTypeDistribution?.data || [],
        backgroundColor: chartData?.meetingTypeDistribution?.colors || [],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
        cutout: '60%',
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
      {/* Monthly Trends - Line Chart */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Aylık Randevu Trendleri
        </h3>
        <div className='h-64'>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
      {/* Status Distribution - Pie Chart */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Durum Dağılımı
        </h3>
        <div className='h-64'>
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>
      {/* Consultant Performance - Bar Chart */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Danışman Performansı
        </h3>
        <div className='h-64'>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
      {/* Meeting Type Distribution - Doughnut Chart */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Görüşme Türü Dağılımı
        </h3>
        <div className='h-64'>
          <Doughnut data={doughnutChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
