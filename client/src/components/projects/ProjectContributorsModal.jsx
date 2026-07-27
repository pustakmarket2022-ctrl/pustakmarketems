import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import { getProjectContributors } from '../../services/projectService';
import { Users, CheckCircle2, Clock, BookOpen, UserCheck, Layers } from 'lucide-react';

const ProjectContributorsModal = ({ isOpen, onClose, projectId, projectData = null }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (projectId) {
        fetchData(projectId);
      } else if (projectData) {
        setDetails({
          project: projectData,
          assignedEmployees: projectData.assignedEmployees || [],
          tasks: projectData.tasks || [],
        });
      }
    }
  }, [isOpen, projectId, projectData]);

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const res = await getProjectContributors(id);
      setDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch project contributors:', err);
    } finally {
      setLoading(false);
    }
  };

  const project = details?.project || projectData;
  const assignedEmployees = details?.assignedEmployees || [];
  const tasks = details?.tasks || [];

  // Group tasks by employee
  const employeeWorkMap = {};

  assignedEmployees.forEach((emp) => {
    employeeWorkMap[emp._id] = {
      employee: emp,
      tasks: [],
      completedCount: 0,
    };
  });

  tasks.forEach((t) => {
    const assignedList = Array.isArray(t.assignedTo) ? t.assignedTo : [t.assignedTo];
    assignedList.forEach((empObj) => {
      const empId = typeof empObj === 'object' ? empObj?._id : empObj;
      if (empId) {
        if (!employeeWorkMap[empId]) {
          employeeWorkMap[empId] = {
            employee: typeof empObj === 'object' ? empObj : { fullName: 'Employee', _id: empId },
            tasks: [],
            completedCount: 0,
          };
        }
        employeeWorkMap[empId].tasks.push(t);
        if (t.taskStatus === 'Completed' || t.taskStatus === 'Approved') {
          employeeWorkMap[empId].completedCount += 1;
        }
      }
    });
  });

  const employeeWorkList = Object.values(employeeWorkMap);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Book Contributors & Task Breakdown`}
      maxWidth="750px"
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {/* Header Summary Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
              border: '1px solid var(--border-color)',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary)" /> {project?.bookName || project?.projectName || 'Book Title'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Author: <strong>{project?.author || 'N/A'}</strong> | ISBN: <strong>{project?.ISBN || 'N/A'}</strong> | Format: <strong>{project?.publicationType || 'Book'}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {employeeWorkList.length} Contributor{employeeWorkList.length !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {tasks.length} Total Task{tasks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Contributors & Work Breakdown */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} /> Team Members & Work Summary (या पुस्तकावर कोणी काय काम केले):
          </h4>

          {employeeWorkList.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No team members assigned or tasks recorded for this book yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {employeeWorkList.map(({ employee, tasks: empTasks, completedCount }) => (
                <div
                  key={employee._id}
                  style={{
                    background: 'var(--bg-input)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {employee.fullName ? employee.fullName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem', display: 'block' }}>{employee.fullName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {employee.designation || employee.department || 'Team Contributor'} {employee.employeeId ? `(${employee.employeeId})` : ''}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <strong>{completedCount}</strong> / {empTasks.length} Work Tasks Completed
                    </span>
                  </div>

                  {/* Task list done by this employee */}
                  {empTasks.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Assigned to book team, no specific task assigned yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {empTasks.map((t) => (
                        <div
                          key={t._id}
                          style={{
                            background: 'var(--bg-main)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={14} color="var(--primary)" />
                            <strong>{t.taskTitle}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ({t.progressPercentage || 0}% Done)
                            </span>
                          </div>
                          <Badge text={t.taskStatus} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="modal-footer" style={{ padding: '16px 0 0 0', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close Window
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProjectContributorsModal;
