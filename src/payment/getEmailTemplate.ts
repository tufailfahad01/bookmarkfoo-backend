export const emailTemplate = (
  name: string,
  categories: number,
  price: number,
) => {
  return `
    Hi ${name},
    
    Thanks for using BookmarkFu!
    Your categories and links are attached - when you open your links bookmark them to your favorite browser for easy 
    access later.

    We are constantly adding new exciting categories - Check back soon!

    Enjoy!
    Bookmark Fu A team
  `;
};
