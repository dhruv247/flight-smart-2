/**
 * Format date and time from a Date object
 */
const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return {
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    date: date
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
  };
};

export default formatDateTime;
