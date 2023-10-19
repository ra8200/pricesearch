'use server'

// import { revalidatePath } from "next/cache";
// import Product from "../models/product.model";
// import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
// import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
// import { User } from "@/types";
// import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
 if(!productUrl) return;
 
 try {
    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    
 } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`)
 }
}