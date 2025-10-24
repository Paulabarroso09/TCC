function toggleEdit(sectionId) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll("input");
    const isEditing = !inputs[0].readOnly;
  
    inputs.forEach(input => {
      input.readOnly = isEditing;
      if (!isEditing) input.focus();
    });
  
    showNotification(isEditing ? "Edição bloqueada" : "Campos habilitados para edição", "info");
  }
  
  function saveChanges() {
    showNotification("Alterações salvas com sucesso!", "success");
  }
  
  function cancelEdit() {
    showNotification("Edição cancelada", "warning");
  }
  
  function changePassword() {
    showNotification("Link para alterar senha enviado ao e-mail.", "info");
  }
  
  function enable2FA() {
    showNotification("Autenticação em 2 fatores ativada.", "success");
  }
  
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
  
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      info: "#00aaff",
      warning: "#f0ad4e"
    };
  
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      opacity: 0;
      transition: all 0.3s ease;
    `;
  
    document.body.appendChild(notification);
    setTimeout(() => (notification.style.opacity = 1), 100);
    setTimeout(() => {
      notification.style.opacity = 0;
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  