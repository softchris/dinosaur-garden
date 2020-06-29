export const createAnnouncement = (message, cb, color = 'red') => {
  console.log(message)

  setTimeout(() => {
    cb();
  }, 2000);
}