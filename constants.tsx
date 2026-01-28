
import React from 'react';
import { WorkType } from './types';

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  [WorkType.FULL_DAY]: 'Dia Inteiro',
  [WorkType.HALF_DAY]: 'Meio Dia',
  [WorkType.ABSENT]: 'Faltou',
  [WorkType.OVERTIME]: 'Hora Extra'
};

export const WORK_TYPE_COLORS: Record<WorkType, string> = {
  [WorkType.FULL_DAY]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [WorkType.HALF_DAY]: 'bg-amber-100 text-amber-700 border-amber-200',
  [WorkType.ABSENT]: 'bg-rose-100 text-rose-700 border-rose-200',
  [WorkType.OVERTIME]: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

export const APP_STORAGE_KEY = 'lavacar_manager_data';
