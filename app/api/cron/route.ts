import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose"
import { generateEmailBody, sendMail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function get() {
    try {
        connectToDB();

        const products = await Product.find({});

        if(!products) throw new Error("No products found");

        // 1. SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
        const updatedPProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
               
                if(!scrapedProduct) throw new Error("No product found");

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice }
                  ]
              
                  const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                  }
              
                const updatedProduct = await Product.findOneAndUpdate(
                  { url: scrapedProduct.url },
                  product,
                );
               
                // 2. CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
                const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);

                if(emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                      title: updatedProduct.title,
                      url: updatedProduct.url,
                }

                const emailContent = await generateEmailBody(productInfo, emailNotifType);

                const userEmails = updatedProduct.users.map((user: any) => user.email);

                await sendMail(emailContent, userEmails);
              }

              return updatedProduct;
            })
        )
      return NextResponse.json({
        message: 'Ok', data: updatedPProducts
      })
    } catch (error) {
        throw new Error(`Error 1 Get: ${error}`)
    }
}