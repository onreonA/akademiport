'use client';
import {
  RiErrorWarningLine,
  RiLoader4Line,
  RiWifiLine,
  RiWifiOffLine,
} from 'react-icons/ri';
interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  className?: string;
}
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: RiLoader4Line,
          text: 'Bağlanıyor...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          animate: 'animate-spin',
        };
      case 'connected':
        return {
          icon: RiWifiLine,
          text: 'Bağlı',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          animate: '',
        };
      case 'disconnected':
        return {
          icon: RiWifiOffLine,
          text: 'Bağlantı Kesildi',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          animate: '',
        };
      case 'error':
        return {
          icon: RiErrorWarningLine,
          text: 'Bağlantı Hatası',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          animate: '',
        };
      default:
        return {
          icon: RiWifiOffLine,
          text: 'Bilinmeyen',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          animate: '',
        };
    }
  };
  const config = getStatusConfig();
  const Icon = config.icon;
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <Icon className={`w-4 h-4 ${config.color} ${config.animate}`} />
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};
export default ConnectionStatus;
