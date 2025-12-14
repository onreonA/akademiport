import { useState, useEffect } from 'react';

interface TaskDependencyInfo {
  hasDependencies: boolean;
  hasBlockingDependencies: boolean;
  incompleteBlockingDependencies: number;
  totalDependencies: number;
}

export function useTaskDependencies(taskId: string | null) {
  const [dependencyInfo, setDependencyInfo] = useState<TaskDependencyInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setDependencyInfo(null);
      return;
    }

    const fetchDependencyInfo = async () => {
      try {
        setLoading(true);
        const [dependenciesResponse, checkResponse] = await Promise.all([
          fetch(`/api/tasks/${taskId}/dependencies`),
          fetch(`/api/tasks/${taskId}/dependencies/check`),
        ]);

        if (dependenciesResponse.ok && checkResponse.ok) {
          const dependenciesData = await dependenciesResponse.json();
          const checkData = await checkResponse.json();

          const blockingDependencies =
            dependenciesData.dependencies?.filter(
              (dep: { dependencyType: string }) => dep.dependencyType === 'blocks'
            ) || [];

          setDependencyInfo({
            hasDependencies: (dependenciesData.dependencies?.length || 0) > 0,
            hasBlockingDependencies: blockingDependencies.length > 0,
            incompleteBlockingDependencies: checkData.incompleteDependencies?.length || 0,
            totalDependencies: dependenciesData.dependencies?.length || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching task dependencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencyInfo();
  }, [taskId]);

  return { dependencyInfo, loading };
}
