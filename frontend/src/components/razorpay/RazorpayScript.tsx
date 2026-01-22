
import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

interface RazorpayScriptProps {
  onLoad?: () => void;
}

const RazorpayScript: React.FC<RazorpayScriptProps> = ({ onLoad }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) {
      logger.info("Razorpay SDK already loaded");
      setLoaded(true);
      if (onLoad) onLoad();
      return;
    }

    // Function to load the script
    const loadScript = () => {
      // Remove any existing script to prevent duplicates
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        existingScript.remove();
        logger.info("Removed existing Razorpay script");
      }

      // Create and add the script to the document
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-priority", "high");
      script.setAttribute("importance", "high");
      script.setAttribute("referrerpolicy", "origin");
      script.integrity = "";
      
      // Define load and error handlers
      script.onload = () => {
        logger.info("Razorpay SDK loaded successfully");
        setLoaded(true);
        
        // Add custom styling to ensure Razorpay modal gets proper z-index and focus
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-razorpay-styles', 'true');
        styleEl.innerHTML = `
          .razorpay-container, .razorpay-checkout-frame, .razorpay-payment-button {
            z-index: 999999 !important;
          }
          .razorpay-backdrop {
            z-index: 999998 !important;
          }
          /* Better focus handling */
          .razorpay-checkout-frame {
            max-width: 500px !important;
            width: 100% !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            outline: none !important;
            display: block !important;
            visibility: visible !important;
            border: none !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.2) !important;
            pointer-events: auto !important;
          }
          body.razorpay-open {
            overflow: hidden !important;
          }
          /* Critical fix: ensure inputs are clickable */
          .razorpay-checkout-frame * {
            pointer-events: auto !important;
          }
        `;
        document.head.appendChild(styleEl);
        
        // Give a bit more time for the SDK to initialize fully
        setTimeout(() => {
          logger.info("Executing onLoad callback");
          if (onLoad) onLoad();
        }, 300);
      };
      
      script.onerror = (error) => {
        logger.error("Failed to load Razorpay SDK:", error);
        
        // If this is not the last attempt, try again
        if (loadAttempts < 3) {
          logger.info(`Retrying Razorpay SDK load (attempt ${loadAttempts + 1}/3)`);
          setLoadAttempts(prev => prev + 1);
          setTimeout(loadScript, 1000);
        } else {
          toast.error("Failed to load payment gateway. Please check if any content blockers are enabled and disable them for this site.");
        }
      };
      
      // Add script to document
      document.body.appendChild(script);
      logger.info("Added Razorpay script to document");
    };

    // Start loading the script
    loadScript();
    
    // Setup MutationObserver to watch for Razorpay iframe and ensure it's visible and focused
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check if the node itself is the Razorpay frame or contains it
              const isRazorpayFrame = node.classList.contains('razorpay-checkout-frame');
              const containsRazorpayFrame = node.querySelector('.razorpay-checkout-frame');
              
              if (isRazorpayFrame || containsRazorpayFrame) {
                const frame = isRazorpayFrame ? node : containsRazorpayFrame;
                
                if (frame) {
                  logger.info("Razorpay frame detected, ensuring visibility and interaction...");
                  
                  // Apply styles directly to ensure visibility and interactivity
                  setTimeout(() => {
                    if (frame instanceof HTMLElement) {
                      // Remove any overlay elements that might block interaction
                      document.querySelectorAll('.razorpay-overlay').forEach(overlay => {
                        if (overlay instanceof HTMLElement) {
                          overlay.style.pointerEvents = 'none';
                        }
                      });
                      
                      // Make frame interactive
                      frame.style.display = 'block';
                      frame.style.visibility = 'visible';
                      frame.style.zIndex = '999999';
                      frame.style.position = 'fixed';
                      frame.style.top = '50%';
                      frame.style.left = '50%';
                      frame.style.transform = 'translate(-50%, -50%)';
                      frame.style.pointerEvents = 'auto';
                      
                      try {
                        // Add tabindex if it doesn't exist
                        if (!frame.hasAttribute('tabindex')) {
                          frame.setAttribute('tabindex', '0');
                        }
                        
                        // Try to focus on the element
                        frame.focus({preventScroll: false});
                      } catch (e) {
                        logger.warn("Could not focus Razorpay iframe:", e);
                      }
                    }
                  }, 300);
                }
              }
            }
          });
        }
      });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      // Cleanup
      observer.disconnect();
      
      const script = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (script) {
        script.remove();
      }
      
      // Remove any custom styles we added
      const customStyle = document.querySelector('style[data-razorpay-styles]');
      if (customStyle) {
        customStyle.remove();
      }
      
      // Make sure to remove the razorpay-open class
      document.body.classList.remove('razorpay-open');
    };
  }, [onLoad, loadAttempts]);

  return null; // This component doesn't render anything
};

export default RazorpayScript;
