import React, { Component } from 'react'
import { View } from 'react-native'
import GanttChart from 'react-native-gantt-chart'

const tasks = [
    {
      id: '1',
      name: 'Design',
      start: '2025-06-20',
      end: '2025-06-22',
      progress: 80,
    },
    {
      id: '2',
      name: 'Development',
      start: '2025-06-23',
      end: '2025-06-28',
      progress: 40,
    },
  ];

export default function ResourceScreen() {
    return <GanttChart
      tasks={tasks}
      viewMode="Day"
      headerHeight={50}
      columnWidth={60}
    />
}