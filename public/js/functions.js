const deleteEvent = (id) => {
  if (confirm('Delete this event?')) {
    document.getElementById('deleteForm' + id).submit();
  }
};

const deleteCategory = (id) => {
  if (confirm('Delete this category?')) {
    document.getElementById('deleteForm' + id).submit();
  }
};

const deleteSubcategory = (id) => {
  if (confirm('Delete this subcategory?')) {
    document.getElementById('deleteForm' + id).submit();
  }
};

const deleteUser = (id) => {
  if (confirm('Delete this user?')) {
    document.getElementById('deleteForm' + id).submit();
  }
};

const deleteReview = (id) => {
  if (confirm('Delete this review?')) {
    document.getElementById('deleteForm' + id).submit();
  }
};

const removeMessage = (classeDiv, delay) => {
  setTimeout(() => {
    const div = document.querySelector(`.${classeDiv}`);
    if (div) {
      div.remove();
    }
  }, delay);
};

removeMessage('errors', 5000);
