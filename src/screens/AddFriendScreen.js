import React from 'react';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';

export default function AddFriendScreen({ th, S, themeName, editName, setEditName, addFriend, go }) {
  return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>go("friends")}>‹</button>
        <h2 style={S.title}>Vriend Toevoegen</h2>
      </div>
      <div style={{padding:16}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <Avatar player={{name:editName||"?"}} size={80} th={th} style={{margin:"0 auto"}}/>
        </div>
        <label style={S.label}>Naam</label>
        <input style={{...S.input,marginBottom:24}} value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Naam..." autoFocus/>
        <button style={S.primary} onClick={addFriend}>Opslaan</button>
      </div>
    </Wrap>
  );
}
