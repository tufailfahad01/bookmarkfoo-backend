export const emailTemplate = (name: string, categories: number, price: number) => {
  return `
    Hi ${name},
    Thanks for using Bookmark Foo! Your links are attached - when you open your links bookmark them to your favorite browser for easy access later.

    You can download your links here 
    
    Here’s your special offer ${categories} categories for only $${price}
    Enjoy! 
    Bookmark A team
  `
}