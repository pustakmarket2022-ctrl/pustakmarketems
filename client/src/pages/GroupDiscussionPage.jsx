import React, { useState, useEffect, useContext, useRef } from 'react';
import { MessageSquare, Plus, Send, Paperclip, Users, FileText, UserPlus, UserMinus, X } from 'lucide-react';
import {
  getGroups,
  createGroup,
  getGroupMessages,
  sendMessage,
  addGroupMember,
  removeGroupMember,
} from '../services/groupService';
import { getUsers } from '../services/userService';
import { initSocket } from '../services/socketService';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const GroupDiscussionPage = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const messagesEndRef = useRef(null);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await getGroups();
      setGroups(res.data || []);
      if (res.data && res.data.length > 0 && !activeGroup) {
        setActiveGroup(res.data[0]);
      }
    } catch (e) {
      addToast('Failed to load discussion groups', 'danger');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      setLoadingMessages(true);
      const res = await getGroupMessages(groupId);
      setMessages(res.data || []);
    } catch (e) {
      addToast('Failed to load messages', 'danger');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    getUsers({ limit: 100 }).then((res) => setEmployees(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeGroup) {
      fetchMessages(activeGroup._id);
    }
  }, [activeGroup]);

  // Real-time Socket.IO listener & 3-second auto-polling for instant messages
  useEffect(() => {
    if (!user || !activeGroup) return;

    const userId = user.id || user._id;
    const socket = initSocket(userId);

    if (socket) {
      socket.emit('join_group_room', activeGroup._id);

      const handleNewMessage = (newMsg) => {
        const msgGroupId = typeof newMsg.group === 'object' ? newMsg.group._id : newMsg.group;
        if (msgGroupId === activeGroup._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        }
      };

      socket.on('new_group_message', handleNewMessage);

      // Auto-polling interval as a fallback (every 3 seconds)
      const pollInterval = setInterval(() => {
        getGroupMessages(activeGroup._id)
          .then((res) => {
            const fetched = res.data || [];
            setMessages((prev) => {
              if (fetched.length !== prev.length) return fetched;
              if (fetched.length > 0 && prev.length > 0 && fetched[fetched.length - 1]._id !== prev[prev.length - 1]._id) {
                return fetched;
              }
              return prev;
            });
          })
          .catch(() => {});
      }, 3000);

      return () => {
        socket.off('new_group_message', handleNewMessage);
        clearInterval(pollInterval);
      };
    }
  }, [user, activeGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;
    if (!activeGroup) return;

    try {
      const formData = new FormData();
      formData.append('message', text);
      if (selectedFile) {
        formData.append('attachments', selectedFile);
      }

      const res = await sendMessage(activeGroup._id, formData);
      setMessages([...messages, res.data]);
      setText('');
      setSelectedFile(null);
    } catch (e) {
      addToast('Failed to send message', 'danger');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName) return;
    setCreating(true);

    try {
      const res = await createGroup({
        name: groupName,
        description: groupDesc,
        members: selectedMembers,
      });
      addToast('Discussion group created successfully', 'success');
      setGroups([res.data, ...groups]);
      setActiveGroup(res.data);
      setShowModal(false);
      setGroupName('');
      setGroupDesc('');
      setSelectedMembers([]);
    } catch (e) {
      addToast('Failed to create group', 'danger');
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((mId) => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  // Add a new member to the active group
  const handleAddMember = async (memberId) => {
    if (!activeGroup || !memberId) return;
    setActionLoading(true);
    try {
      const res = await addGroupMember(activeGroup._id, memberId);
      addToast(res.message || 'Member added to group', 'success');
      setActiveGroup(res.data);
      setGroups(groups.map((g) => (g._id === res.data._id ? res.data : g)));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add member to group', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove a member from the active group
  const handleRemoveMember = async (memberId) => {
    if (!activeGroup || !memberId) return;
    setActionLoading(true);
    try {
      const res = await removeGroupMember(activeGroup._id, memberId);
      addToast(res.message || 'Member removed from group', 'success');
      setActiveGroup(res.data);
      setGroups(groups.map((g) => (g._id === res.data._id ? res.data : g)));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to remove member from group', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const getFileUrl = (att) => {
    if (!att) return '#';
    const filePath = typeof att === 'string' ? att : (att.filePath || att.path || att.url || '');
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const cleanPath = filePath.replace(/\\/g, '/');
    let backendUrl = 'http://localhost:5000';
    if (process.env.REACT_APP_API_URL) {
      backendUrl = process.env.REACT_APP_API_URL.replace('/api', '');
    } else if (typeof window !== 'undefined' && window.location) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      backendUrl = `${protocol}//${hostname}:5000`;
    }
    return `${backendUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const isImageFile = (fileNameOrPath = '') => {
    const ext = fileNameOrPath.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  // Helpers to get current active group members vs non-members
  const currentMemberIds = (activeGroup?.members || []).map((m) => (typeof m === 'object' ? m._id : m));
  const nonMembers = employees.filter((emp) => !currentMemberIds.includes(emp._id));

  return (
    <div className="page-container" style={{ paddingBottom: '0' }}>
      <div className="page-header flex-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <MessageSquare color="var(--primary)" size={28} /> Group Discussion
          </h1>
          <p className="page-subtitle">Collaborate, discuss & share files with project teams</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Group
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', minHeight: 'calc(100vh - 220px)' }}>
        {/* Left Sidebar: Groups list */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Groups</h3>
          {loadingGroups ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading...</div>
          ) : groups.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No groups found.</div>
          ) : (
            <div className="flex-col" style={{ gap: '8px', overflowY: 'auto' }}>
              {groups.map((grp) => (
                <div
                  key={grp._id}
                  onClick={() => setActiveGroup(grp)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: activeGroup?._id === grp._id ? 'var(--primary)' : 'var(--bg-input)',
                    color: activeGroup?._id === grp._id ? '#fff' : 'var(--text-main)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{grp.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                    {grp.members?.length || 0} Members
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Chat Stream */}
        <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeGroup ? (
            <>
              {/* Group Title Header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{activeGroup.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    {activeGroup.description || 'General Discussion Group'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm flex-row"
                  style={{ gap: '6px' }}
                  onClick={() => setShowManageModal(true)}
                >
                  <Users size={16} /> Manage Members ({activeGroup.members?.length || 0})
                </button>
              </div>

              {/* Messages area */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px' }}>
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                    No messages yet. Send a message to start the discussion!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?._id === user?.id || msg.sender?._id === user?._id;
                    return (
                      <div
                        key={msg._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                          {msg.sender?.fullName} ({msg.sender?.role})
                        </div>
                        <div
                          style={{
                            maxWidth: '75%',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: isMe ? 'var(--primary)' : 'var(--bg-input)',
                            color: isMe ? '#fff' : 'var(--text-main)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          {msg.message}

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {msg.attachments.map((att, idx) => {
                                const fullUrl = getFileUrl(att);
                                const fileName = att.fileName || (typeof att === 'string' ? att.split('/').pop() : 'Attachment');
                                const isImg = isImageFile(fullUrl || fileName);

                                if (isImg) {
                                  return (
                                    <div key={idx} style={{ marginTop: '4px' }}>
                                      <a href={fullUrl} target="_blank" rel="noreferrer">
                                        <img
                                          src={fullUrl}
                                          alt={fileName}
                                          style={{
                                            maxWidth: '100%',
                                            maxHeight: '220px',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            display: 'block',
                                          }}
                                        />
                                      </a>
                                    </div>
                                  );
                                }

                                return (
                                  <a
                                    key={idx}
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={fileName}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      background: isMe ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-card)',
                                      color: isMe ? '#ffffff' : 'var(--primary)',
                                      border: '1px solid var(--border-color)',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <FileText size={15} /> {fileName}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected File Bar Preview */}
              {selectedFile && (
                <div
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-input)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                    <Paperclip size={16} /> Attached File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                    title="Remove Attachment"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Message Input Box */}
              <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                <label className="btn btn-secondary" style={{ padding: '10px', cursor: 'pointer' }} title="Attach File">
                  <Paperclip size={18} />
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={selectedFile ? `Attached: ${selectedFile.name}` : 'Type your message...'}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a group from the list to view discussion.
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create Group Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Create Discussion Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Editorial Proofreaders Group"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Group purpose or project..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Group Members</label>
                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
                  {employees.map((emp) => (
                    <label key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(emp._id)}
                        onChange={() => toggleMember(emp._id)}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{emp.fullName} ({emp.department})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage Group Members Modal (Add & Remove) */}
      {showManageModal && activeGroup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', width: '100%' }}>
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Manage Members - {activeGroup.name}
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowManageModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Section 1: Current Members */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-muted)' }}>
                Current Group Members ({activeGroup.members?.length || 0})
              </h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
                {activeGroup.members && activeGroup.members.length > 0 ? (
                  activeGroup.members.map((m) => {
                    const mObj = typeof m === 'object' ? m : employees.find((e) => e._id === m) || { _id: m, fullName: 'User' };
                    return (
                      <div
                        key={mObj._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-color)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mObj.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {mObj.designation || mObj.department || mObj.role || 'Member'}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm flex-row"
                          style={{ gap: '4px', padding: '4px 10px', fontSize: '0.75rem' }}
                          disabled={actionLoading}
                          onClick={() => handleRemoveMember(mObj._id)}
                        >
                          <UserMinus size={14} /> Remove
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No members in this group.</div>
                )}
              </div>
            </div>

            {/* Section 2: Add New Members */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-muted)' }}>
                Add New Members to Group
              </h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
                {nonMembers.length > 0 ? (
                  nonMembers.map((emp) => (
                    <div
                      key={emp._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {emp.designation || emp.department || 'Employee'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-success btn-sm flex-row"
                        style={{ gap: '4px', padding: '4px 10px', fontSize: '0.75rem', background: '#16a34a', color: '#fff', border: 'none' }}
                        disabled={actionLoading}
                        onClick={() => handleAddMember(emp._id)}
                      >
                        <UserPlus size={14} /> Add to Group
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    All employees are already members of this group.
                  </div>
                )}
              </div>
            </div>

            <div className="flex-row" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowManageModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDiscussionPage;
