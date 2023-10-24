import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose"
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "@/lib/utils";

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
               
                // 2. ChECH EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
                const emailNotify


            })
        )

    } catch (error) {
        throw new Error(`Error 1 Get: ${error}`)
    }
}