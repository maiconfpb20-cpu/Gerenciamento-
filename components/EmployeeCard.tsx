
import React from 'react';
import { Employee, WorkType } from '../types';
import { WORK_TYPE_LABELS, WORK_TYPE_COLORS } from '../constants';

interface EmployeeCardProps {
  employee: Employee;
  onClick: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick, onEdit, onDelete }) => {
  const totalDays = employee.entries.filter(e => e.type !== WorkType.ABSENT).length;
  
  const calculateTotal = () => {
    return employee.entries.reduce((acc, entry) => {
      let val = 0;
      if (entry.type === WorkType.FULL_DAY) val = employee.dailyRate;
      if (entry.type === WorkType.HALF_DAY) val = employee.dailyRate / 2;
      if (entry.type === WorkType.OVERTIME) val = (employee.dailyRate / 8) * (entry.hours || 1) * 1.5;
      return acc + val + (entry.bonus || 0);
    }, 0);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-blue-300 transition-all cursor-pointer group relative"
      onClick={() => onClick(employee.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
          <p className="text-sm text-slate-500">{employee.position}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(employee); }}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar Funcionário"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remover Funcionário"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-tighter">Dias</p>
          <p className="text-lg font-bold text-slate-700">{totalDays}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-xs text-blue-400 uppercase font-semibold tracking-tighter">Saldo</p>
          <p className="text-lg font-bold text-blue-600 truncate">
            R${calculateTotal().toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
};
