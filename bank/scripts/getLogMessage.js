export const getLogMessage = ({ message }) => {
    const currentDate = new Date().toISOString();
  
    const [date, fulltime] = currentDate.split('T');
    const [time] = fulltime.split('.');
  
    const formattedDate = `${date} ${time} UTC`
  
    return `[${formattedDate}] ${message}`;
};
