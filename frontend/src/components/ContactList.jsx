import React from "react";

const ContactList = ({ contacts, onContactClick, currentUserId, currentUserData, onActionDone }) => (
  <div className="w-full bg-white rounded-lg shadow-md p-4">
    <h2 className="text-lg font-bold mb-4">Contacts</h2>
    <ul>
      {contacts.slice(0, 10).map((contact) => (
        <li
          key={contact._id}
          className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded justify-between"
        >
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onContactClick(contact)}>
            <img
              src={contact.imageUrl || "/default-avatar.png"}
              alt={contact.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span>{contact.username}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ContactList; 