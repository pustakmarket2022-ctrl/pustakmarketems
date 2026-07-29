import api from './api';

export const createGroup = async (data) => {
  const res = await api.post('/groups', data);
  return res.data;
};

export const getGroups = async () => {
  const res = await api.get('/groups');
  return res.data;
};

export const getGroupMessages = async (groupId) => {
  const res = await api.get(`/groups/${groupId}/messages`);
  return res.data;
};

export const sendMessage = async (groupId, formData) => {
  const res = await api.post(`/groups/${groupId}/messages`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const addGroupMember = async (groupId, memberId) => {
  const res = await api.post(`/groups/${groupId}/members`, { memberId });
  return res.data;
};

export const removeGroupMember = async (groupId, memberId) => {
  const res = await api.delete(`/groups/${groupId}/members/${memberId}`);
  return res.data;
};
