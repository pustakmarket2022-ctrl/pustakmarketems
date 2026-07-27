import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Users } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/projectService';
import { getUsers } from '../../services/userService';
import ProjectFormModal from '../../components/projects/ProjectFormModal';
import ProjectContributorsModal from '../../components/projects/ProjectContributorsModal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';

const publicationTypes = ['All Formats', 'Book', 'eBook', 'Magazine', 'Journal', 'Research Paper'];
const statuses = ['All Statuses', 'Planning', 'Active', 'Hold', 'Completed', 'Cancelled'];

const ProjectsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [publicationType, setPublicationType] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);
  const [isContributorsModalOpen, setIsContributorsModalOpen] = useState(false);
  const [selectedProjForContributors, setSelectedProjForContributors] = useState(null);

  const handleOpenContributors = (proj) => {
    setSelectedProjForContributors(proj);
    setIsContributorsModalOpen(true);
  };

  const fetchEmployees = async () => {
    try {
      const res = await getUsers({ limit: 100 });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProjects({
        page: currentPage,
        search,
        publicationType: publicationType === 'All Formats' ? '' : publicationType,
        status: status === 'All Statuses' ? '' : status,
        limit: 9,
      });
      setProjects(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      addToast('Failed to fetch projects', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, publicationType, status, addToast]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenAdd = () => {
    setSelectedProj(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setSelectedProj(proj);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedProj) {
        await updateProject(selectedProj._id, data);
        addToast('Project updated successfully', 'success');
      } else {
        await createProject(data);
        addToast('Project created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'danger');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete project '${name}'?`)) {
      try {
        await deleteProject(id);
        addToast('Project deleted', 'success');
        fetchProjects();
      } catch (err) {
        addToast(err.response?.data?.message || 'Delete failed', 'danger');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Publication Projects</h1>
          <p className="page-subtitle">Track book publishing lifecycles, authors, ISBNs, & milestones</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> New Publication Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by Project ID, Book Name, Author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-row" style={{ gap: '10px' }}>
          <select
            className="form-select"
            value={publicationType}
            onChange={(e) => setPublicationType(e.target.value)}
          >
            {publicationTypes.map((t) => (
              <option key={t} value={t === 'All Formats' ? '' : t}>
                {t}
              </option>
            ))}
          </select>

          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s === 'All Statuses' ? '' : s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {projects.map((p) => (
            <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{p.projectId}</strong>
                <Badge text={p.status} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{p.bookName}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Author: <strong>{p.author}</strong> | {p.publicationType}
                </div>
                {p.ISBN && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ISBN: {p.ISBN}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completion Progress</span>
                  <strong>{p.completionPercentage}%</strong>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${p.completionPercentage}%` }} />
                </div>
              </div>

              <div
                className="flex-row"
                style={{
                  justify: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Budget: </span>
                  <strong>₹{(p.estimatedBudget || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                  <strong>{new Date(p.deadline).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex-row" style={{ gap: '-8px' }}>
                  {(p.assignedEmployees || []).slice(0, 3).map((emp, i) => (
                    <div
                      key={emp._id || i}
                      className="avatar-placeholder"
                      style={{ width: '30px', height: '30px', fontSize: '0.75rem', border: '2px solid var(--bg-card)' }}
                      title={emp.fullName}
                    >
                      {emp.fullName ? emp.fullName.charAt(0) : 'U'}
                    </div>
                  ))}
                  {p.assignedEmployees?.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      +{p.assignedEmployees.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex-row" style={{ gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}
                    onClick={() => handleOpenContributors(p)}
                    title="View Team & Work Summary"
                  >
                    <Users size={14} /> Work Summary
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(p)}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.bookName)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={pages} onPageChange={(p) => setCurrentPage(p)} />

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        employees={employees}
        initialData={selectedProj}
        isEdit={!!selectedProj}
      />

      <ProjectContributorsModal
        isOpen={isContributorsModalOpen}
        onClose={() => {
          setIsContributorsModalOpen(false);
          setSelectedProjForContributors(null);
        }}
        projectId={selectedProjForContributors?._id}
        projectData={selectedProjForContributors}
      />
    </div>
  );
};

export default ProjectsPage;
