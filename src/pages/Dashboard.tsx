import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceAgent from "@/components/VoiceAgent";
import MessageAgent from "@/components/MessageAgent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Heart, FileText, Users, MessageSquare, Mic } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          navigate("/onboarding");
          return;
        }
        throw error;
      }

      setProfile(profileData);
    } catch (error: any) {
      console.error("Error checking auth:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CuraLink
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.full_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trials">Trials</TabsTrigger>
            <TabsTrigger value="experts">Experts</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saved Items</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Trials</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connections</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto py-4">
                  <FileText className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Find Clinical Trials</p>
                    <p className="text-xs text-muted-foreground">Discover trials matching your conditions</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Connect with Experts</p>
                    <p className="text-xs text-muted-foreground">Find healthcare professionals</p>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trials">
            <Card className="p-8 text-center shadow-[var(--shadow-soft)]">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Clinical Trials Coming Soon</h3>
              <p className="text-muted-foreground">
                We're building an intelligent trial matching system. Stay tuned!
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="experts">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Healthcare Experts</h2>
                <p className="text-muted-foreground">Connect with our network of healthcare professionals and researchers</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Expert 1 - Dr. Rajesh Kumar */}
                <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. Rajesh Kumar</h3>
                      <p className="text-sm text-muted-foreground mb-2">Cardiology Specialist</p>
                      <p className="text-xs text-muted-foreground mb-3">15+ years experience in cardiac care and research</p>
                      <Button size="sm" variant="outline" className="w-full">Connect</Button>
                    </div>
                  </div>
                </Card>

                {/* Expert 2 - Dr. Priya Sharma */}
                <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. Priya Sharma</h3>
                      <p className="text-sm text-muted-foreground mb-2">Oncology Researcher</p>
                      <p className="text-xs text-muted-foreground mb-3">Specializing in cancer immunotherapy and clinical trials</p>
                      <Button size="sm" variant="outline" className="w-full">Connect</Button>
                    </div>
                  </div>
                </Card>

                {/* Expert 3 - Dr. Anil Patel */}
                <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. Anil Patel</h3>
                      <p className="text-sm text-muted-foreground mb-2">Neurology Expert</p>
                      <p className="text-xs text-muted-foreground mb-3">Leading research in neurodegenerative diseases</p>
                      <Button size="sm" variant="outline" className="w-full">Connect</Button>
                    </div>
                  </div>
                </Card>

                {/* Expert 4 - Dr. Meera Reddy */}
                <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. Meera Reddy</h3>
                      <p className="text-sm text-muted-foreground mb-2">Diabetes Specialist</p>
                      <p className="text-xs text-muted-foreground mb-3">Expert in endocrinology and metabolic disorders</p>
                      <Button size="sm" variant="outline" className="w-full">Connect</Button>
                    </div>
                  </div>
                </Card>

                {/* Expert 5 - Dr. Vikram Singh */}
                <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. Vikram Singh</h3>
                      <p className="text-sm text-muted-foreground mb-2">Pulmonology Researcher</p>
                      <p className="text-xs text-muted-foreground mb-3">Respiratory diseases and clinical trial coordination</p>
                      <Button size="sm" variant="outline" className="w-full">Connect</Button>
                    </div>
                  </div>
                </Card>

                {/* Expert 6 - Dr. Kavita Menon */}
                <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. Kavita Menon</h3>
                      <p className="text-sm text-muted-foreground mb-2">Pediatric Specialist</p>
                      <p className="text-xs text-muted-foreground mb-3">Child healthcare and developmental research</p>
                      <Button size="sm" variant="outline" className="w-full">Connect</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <MessageAgent />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceAgent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
