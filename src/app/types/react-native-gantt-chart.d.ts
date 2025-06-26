declare module 'react-native-gantt-chart' {
  import { FC } from 'react';
  import { ViewStyle } from 'react-native';

  export interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
  }

  export interface GanttChartProps {
    tasks: Task[];
    viewMode?: 'Day' | 'Week' | 'Month';
    headerHeight?: number;
    columnWidth?: number;
    barColor?: string;
    labelStyle?: ViewStyle;
    style?: ViewStyle;
  }

  const GanttChart: FC<GanttChartProps>;

  export default GanttChart;
}