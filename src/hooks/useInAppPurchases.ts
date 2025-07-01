
import { useState, useEffect } from 'react';
import { InAppPurchase2 } from '@capacitor-community/in-app-purchase-2';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

interface InAppPurchaseHook {
  products: Product[];
  loading: boolean;
  isNative: boolean;
  purchaseProduct: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const PRODUCT_IDS = {
  basic: 'com.lovable.callcreateconnect.basic_monthly',
  pro: 'com.lovable.callcreateconnect.pro_monthly',
  enterprise: 'com.lovable.callcreateconnect.enterprise_monthly'
};

export const useInAppPurchases = (userId: string | null): InAppPurchaseHook => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative && userId) {
      initializeStore();
    }
  }, [isNative, userId]);

  const initializeStore = async () => {
    try {
      setLoading(true);
      
      // Initialize the store
      await InAppPurchase2.initialize({
        products: Object.values(PRODUCT_IDS)
      });

      // Set up event listeners
      InAppPurchase2.addListener('productUpdated', (product) => {
        console.log('Product updated:', product);
        updateProductList();
      });

      InAppPurchase2.addListener('purchaseUpdated', async (purchase) => {
        console.log('Purchase updated:', purchase);
        await handlePurchaseUpdate(purchase);
      });

      // Load products
      await updateProductList();
      
    } catch (error) {
      console.error('Failed to initialize in-app purchases:', error);
      toast({
        title: "Store Error",
        description: "Failed to initialize app store. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProductList = async () => {
    try {
      const storeProducts = await InAppPurchase2.getProducts();
      const formattedProducts = storeProducts.map(product => ({
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const purchaseProduct = async (productId: string) => {
    try {
      setLoading(true);
      await InAppPurchase2.purchaseProduct({ productId });
      
      toast({
        title: "Purchase Started",
        description: "Processing your subscription purchase...",
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to complete purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      await InAppPurchase2.restorePurchases();
      
      toast({
        title: "Restore Complete",
        description: "Your purchases have been restored.",
      });
    } catch (error) {
      console.error('Restore failed:', error);
      toast({
        title: "Restore Failed",
        description: "Unable to restore purchases. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseUpdate = async (purchase: any) => {
    if (purchase.state === 'purchased' || purchase.state === 'restored') {
      try {
        // Verify purchase with our backend
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase.functions.invoke('verify-in-app-purchase', {
          body: {
            productId: purchase.productId,
            transactionId: purchase.transactionId,
            receipt: purchase.receipt,
            platform: Capacitor.getPlatform()
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        toast({
          title: "Subscription Active",
          description: "Your subscription is now active!",
        });

        // Finish the transaction
        await InAppPurchase2.finishTransaction({ transactionId: purchase.transactionId });
        
      } catch (error) {
        console.error('Failed to verify purchase:', error);
        toast({
          title: "Verification Failed",
          description: "Purchase completed but verification failed. Contact support.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    products,
    loading,
    isNative,
    purchaseProduct,
    restorePurchases
  };
};
