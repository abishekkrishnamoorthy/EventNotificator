import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GroupModal from '../components/Modals/GroupModal';

const ViewGroupsPage = () => {
  const { groups, events } = useApp();
  const { showGroupModal, setShowGroupModal } = useOutletContext();

  return (
    <>
      <div className="page-header">
        <h2><i className="fas fa-users"></i> All Groups</h2>
        <button className="btn btn-primary" onClick={() => setShowGroupModal(true)}>
          <i className="fas fa-plus"></i> Create New Group
        </button>
      </div>
      <div className="groups-grid">
        {groups.length === 0 ? (
          <p className="empty-state">No groups found. Create your first group!</p>
        ) : (
          groups.map(group => {
            const groupEvents = events.filter(e => e.groupId === group.id);
            return (
              <div key={group.id} className="group-card">
                <div className="group-card-header">
                  <h3 className="group-card-name">{group.name}</h3>
                  <p className="group-card-description">{group.description || 'No description'}</p>
                </div>
                <div className="group-card-members">
                  <div className="group-card-members-title">Members ({group.members.length})</div>
                  <div className="group-card-member-list">
                    {group.members.length > 0 ? (
                      group.members.map((email, idx) => (
                        <span key={idx} className="group-card-member">{email}</span>
                      ))
                    ) : (
                      <span className="group-card-member">No members</span>
                    )}
                  </div>
                </div>
                <div className="group-card-footer">
                  <div className="group-card-stats">
                    <i className="fas fa-calendar"></i> {groupEvents.length} event{groupEvents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {showGroupModal && <GroupModal onClose={() => setShowGroupModal(false)} />}
    </>
  );
};

export default ViewGroupsPage;

