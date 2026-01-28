
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, WorkType, WorkEntry } from './types';
import { APP_STORAGE_KEY, WORK_TYPE_LABELS, WORK_TYPE_COLORS } from './constants';
import { EmployeeCard } from './components/EmployeeCard';
import { getAIInsights } from './services/geminiService';

const MASTER_PIN = '1844';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // New/Edit Employee State
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('Lavador');
  const [formRate, setFormRate] = useState(80);

  // Work Entry State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryType, setEntryType] = useState<WorkType>(WorkType.FULL_DAY);
  const [entryBonus, setEntryBonus] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      setEmployees(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MASTER_PIN) {
      setIsLocked(false);
    } else {
      alert('PIN Incorreto');
      setPinInput('');
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormPosition('Lavador');
    setFormRate(80);
    setIsAddingEmployee(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormPosition(emp.position);
    setFormRate(emp.dailyRate);
    setIsAddingEmployee(true);
  };

  const saveEmployee = () => {
    if (!formName) return;

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, name: formName, position: formPosition, dailyRate: formRate } 
          : emp
      ));
    } else {
      const newEmp: Employee = {
        id: crypto.randomUUID(),
        name: formName,
        position: formPosition,
        dailyRate: formRate,
        joinDate: new Date().toISOString(),
        entries: []
      };
      setEmployees([...employees, newEmp]);
    }

    setFormName('');
    setIsAddingEmployee(false);
    setEditingEmployee(null);
  };

  const deleteEmployee = (id: string) => {
    if (confirm('Deseja realmente remover este funcionário?')) {
      setEmployees(employees.filter(e => e.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const addWorkEntry = () => {
    if (!selectedId) return;
    const entry: WorkEntry = {
      id: crypto.randomUUID(),
      date: entryDate,
      type: entryType,
      bonus: entryBonus
    };

    setEmployees(employees.map(emp => {
      if (emp.id === selectedId) {
        const filteredEntries = emp.entries.filter(e => e.date !== entryDate);
        return { ...emp, entries: [...filteredEntries, entry] };
      }
      return emp;
    }));

    setEntryBonus(0);
  };

  const removeEntry = (empId: string, entryId: string) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, entries: emp.entries.filter(e => e.id !== entryId) };
      }
      return emp;
    }));
  };

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === selectedId), 
    [employees, selectedId]
  );

  const generateInsights = async () => {
    if (employees.length === 0) return;
    setIsLoadingInsight(true);
    const text = await getAIInsights(employees);
    setAiInsight(text || null);
    setIsLoadingInsight(false);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
          <p className="text-slate-500 mb-8 text-sm">Digite o PIN do Lava Car para entrar</p>
          
          <form onSubmit={handleUnlock} className="space-y-6">
            <input 
              autoFocus
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl tracking-[1rem] py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
            />
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            >
              Entrar
            </button>
          </form>
        </div>
        <p className="mt-8 text-slate-500 text-xs">Lava Car Manager Pro v2.0</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-slate-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v10H7V11Z"/><path d="M12 2v7"/><path d="M12 21v2"/><path d="M18 11V3"/><path d="M6 11V3"/></svg>
              Lava Car Pro
            </h1>
            <p className="text-blue-100 text-sm">Gestão de Equipe e Pagamentos</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsLocked(true)}
              className="p-2 text-blue-200 hover:text-white transition-colors"
              title="Bloquear"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
            <button 
              onClick={openAddModal}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Novo Funcionário</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / List */}
        <div className="lg:col-span-4 space-y-6">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-700">Equipe ({employees.length})</h2>
              <button 
                onClick={generateInsights}
                disabled={isLoadingInsight || employees.length === 0}
                className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoadingInsight ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                IA Sugestões
              </button>
            </div>

            {aiInsight && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-6 relative animate-in fade-in slide-in-from-top-4">
                <button onClick={() => setAiInsight(null)} className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                <p className="text-sm text-indigo-800 italic leading-relaxed whitespace-pre-line">
                   ✨ {aiInsight}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {employees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400">Nenhum funcionário cadastrado.</p>
                </div>
              ) : (
                employees.map(emp => (
                  <EmployeeCard 
                    key={emp.id} 
                    employee={emp} 
                    onClick={setSelectedId} 
                    onEdit={openEditModal}
                    onDelete={deleteEmployee}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Details Area */}
        <div className="lg:col-span-8">
          {selectedEmployee ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h2>
                    <p className="text-slate-500 font-medium">Diária: R$ {selectedEmployee.dailyRate.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Add Entry Form */}
                <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end border border-slate-100 mb-8">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                    <input 
                      type="date" 
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                    <select 
                      value={entryType}
                      onChange={(e) => setEntryType(e.target.value as WorkType)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Object.entries(WORK_TYPE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Bônus (R$)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={entryBonus || ''}
                      onChange={(e) => setEntryBonus(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <button 
                    onClick={addWorkEntry}
                    className="bg-blue-600 text-white rounded-lg p-2 font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Lançar Dia
                  </button>
                </div>

                {/* History */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Histórico de Lançamentos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-slate-400 text-xs border-b border-slate-100">
                          <th className="pb-3 px-2">Data</th>
                          <th className="pb-3 px-2">Status</th>
                          <th className="pb-3 px-2 text-right">Valor</th>
                          <th className="pb-3 px-2 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEmployee.entries.sort((a,b) => b.date.localeCompare(a.date)).map(entry => {
                          let val = 0;
                          if (entry.type === WorkType.FULL_DAY) val = selectedEmployee.dailyRate;
                          if (entry.type === WorkType.HALF_DAY) val = selectedEmployee.dailyRate / 2;
                          const total = val + (entry.bonus || 0);

                          return (
                            <tr key={entry.id} className="border-b border-slate-50 group">
                              <td className="py-4 px-2 font-medium text-slate-700">
                                {new Date(entry.date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-4 px-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${WORK_TYPE_COLORS[entry.type]}`}>
                                  {WORK_TYPE_LABELS[entry.type]}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-right font-bold text-slate-700">
                                R$ {total.toFixed(2)}
                              </td>
                              <td className="py-4 px-2 text-right">
                                <button 
                                  onClick={() => removeEntry(selectedEmployee.id, entry.id)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {selectedEmployee.entries.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-400 italic">
                              Nenhum dia lançado para este funcionário.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm opacity-60">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Selecione um funcionário</h2>
              <p className="text-slate-500 max-w-xs">Escolha um membro da equipe à esquerda para visualizar detalhes e registrar dias trabalhados.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Employee Modal */}
      {isAddingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingEmployee ? 'Editar Colaborador' : 'Novo Colaborador'}
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Nome Completo</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Cargo</label>
                <select 
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Lavador">Lavador</option>
                  <option value="Secador">Secador</option>
                  <option value="Polidor">Polidor</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Valor Diária (R$)</label>
                <input 
                  type="number" 
                  value={formRate}
                  onChange={(e) => setFormRate(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => { setIsAddingEmployee(false); setEditingEmployee(null); }}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveEmployee}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
              >
                {editingEmployee ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
