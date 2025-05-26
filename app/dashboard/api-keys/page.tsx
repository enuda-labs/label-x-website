'use client';

import { useState, useEffect } from "react";
import DashboardLayout  from "@/components/shared/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Trash2, Plus, Key } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  status: "active" | "revoked";
}

const ApiKeys = () => {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [isGenerating, setIsGenerating] = useState(false);
 

  useEffect(() => {
   
    const fetchApiKeys = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        //Temp data
        setApiKeys([
          {
            id: "api-001",
            name: "Production API",
            key: "lx_prod_4f8b2c1d9e3a7f6b2c8d4e9a1f7c3b5e8d2a6f9c4b7e1d8a3f6c9b2e5d8a1f4c7b",
            created: "2024-01-15",
            lastUsed: "2024-03-20",
            status: "active"
          },
          {
            id: "api-002",
            name: "Development API",
            key: "lx_dev_9a7c4f2b8e1d6c3a9f5b2e8d1c7a4f6b9e2c5d8a1f4c7b3e6d9a2f5c8b1e4d7a",
            created: "2024-02-01",
            lastUsed: null,
            status: "active"
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching API keys:", error);
        setLoading(false);
      }
    };
    
    fetchApiKeys();
  }, []);

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast( "Error",{
        description: "Please enter a name for your API key"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a new API key
      const newKey: ApiKey = {
        id: `api-${Date.now()}`,
        name: newKeyName,
        key: `lx_new_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: null,
        status: "active"
      };
      
      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName("");
      
      toast( "API Key Generated",{
        description: "Your new API key has been created successfully",
      });
      
    } catch {
      toast("Error",{
        description: "Failed to generate API key",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast( "Copied",{
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, status: "revoked" as const } : key
      ));
      
      toast( "API Key Revoked",{
        description: "The API key has been revoked successfully",
      });
    } catch {
      toast( "Error",{
        description: "Failed to revoke API key"
      });
    }
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 8);
  };

  return (
    <DashboardLayout title="API Keys">
      <Alert className="mb-8 bg-white/5 border-white/10">
        <Key className="h-4 w-4" />
        <AlertDescription className="text-white/70">
          API keys allow you to authenticate requests to Label X services. Keep your keys secure and never share them publicly.
        </AlertDescription>
      </Alert>

    
      <Card className="bg-white/5 border-white/10 p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Generate New API Key</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="keyName" className="text-white/80">Key Name</Label>
            <Input
              id="keyName"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API, Development API"
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={generateApiKey}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Key
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

    
      <Card className="bg-white/5 border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Your API Keys</h2>
          <p className="text-white/60 text-sm mt-1">Manage your API keys for accessing Label X services</p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 bg-white/5" />
              <Skeleton className="h-12 bg-white/5" />
              <Skeleton className="h-12 bg-white/5" />
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">Name</TableHead>
                <TableHead className="text-white/80">API Key</TableHead>
                <TableHead className="text-white/80">Created</TableHead>
                <TableHead className="text-white/80">Last Used</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white font-medium">
                    {apiKey.name}
                  </TableCell>
                  
                  <TableCell className="text-white/80 font-mono text-sm">
                    <div className="flex items-center space-x-2">
                      <span>
                        {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-white"
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-white/60">
                    {new Date(apiKey.created).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell className="text-white/60">
                    {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}
                  </TableCell>
                  
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      apiKey.status === "active" 
                        ? "bg-green-400/20 text-green-400" 
                        : "bg-red-400/20 text-red-400"
                    }`}>
                      {apiKey.status}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {apiKey.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeApiKey(apiKey.id)}
                        className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default ApiKeys;
