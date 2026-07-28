import React, { useState, useEffect, useContext, useRef } from 'react';
import { MessageSquare, Plus, Send, Paperclip, Users, FileText } from 'lucide-react';
import { getGroups, createGroup, getGroupMessages, sendMessage } from '../services/groupService';
import { getUsers } from '../services/userService';
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

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);

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
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-input)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeGroup.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activeGroup.description || 'General Discussion Group'}</p>
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
                            <div style={{ marginTop: '8px' }}>
                              {msg.attachments.map((att, idx) => {
                                const fullUrl = att.filePath?.startsWith('http')
                                  ? att.filePath
                                  : `http://localhost:5000${att.filePath?.startsWith('/') ? '' : '/'}${att.filePath}`;
                                return (
                                  <a
                                    key={idx}
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.8rem',
                                      color: isMe ? '#e0e7ff' : 'var(--primary)',
                                      textDecoration: 'underline',
                                    }}
                                  >
                                    <FileText size={14} /> {att.fileName || 'Attachment'}
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
    </div>
  );
};

export default GroupDiscussionPage;
