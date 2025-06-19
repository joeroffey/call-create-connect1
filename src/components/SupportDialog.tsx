
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send } from 'lucide-react';

const supportFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required').min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(1, 'Message is required').min(10, 'Message must be at least 10 characters'),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  subscription: any;
  hasActiveSubscription: boolean;
}

const SupportDialog = ({ open, onOpenChange, user, subscription, hasActiveSubscription }: SupportDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const handleSubmit = async (data: SupportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get subscription details
      const subscriptionTier = subscription?.plan_type 
        ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
        : 'Free';

      const subscriptionStatus = hasActiveSubscription ? 'Active' : 'Inactive';
      const subscriptionEndDate = subscription?.current_period_end 
        ? new Date(subscription.current_period_end).toLocaleDateString()
        : 'N/A';

      // Create email body with all details
      const emailBody = encodeURIComponent(`Hello EezyBuild Support Team,

Subject: ${data.subject}

Issue Description:
${data.message}

User Details:
- User ID: ${user?.id || 'N/A'}
- Email: ${user?.email || 'N/A'}
- Name: ${user?.user_metadata?.name || 'N/A'}
- Member Since: ${user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}

Subscription Details:
- Plan: ${subscriptionTier}
- Status: ${subscriptionStatus}
- End Date: ${subscriptionEndDate}

Best regards,
${user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}`);

      const mailtoLink = `mailto:info@eezybuild.com?subject=${encodeURIComponent(`Support: ${data.subject}`)}&body=${emailBody}`;
      console.log('Opening email client with support request');
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      toast({
        title: "Email client opened",
        description: "Your email client should open with your support request",
      });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating support email:', error);
      toast({
        title: "Error",
        description: "Unable to open email client. Please email info@eezybuild.com directly",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Contact Support
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send us a message and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of your issue"
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail..."
                      className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-400">
              <p className="mb-1">Your email and subscription details will be automatically included.</p>
              <p>Current plan: <span className="text-white font-medium">
                {subscription?.plan_type ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1) : 'Free'}
              </span></p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Support Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
