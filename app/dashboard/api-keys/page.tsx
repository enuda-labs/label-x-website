'use client';

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Trash2, Plus, Key } from "lucide-react";
import { ACCESS_TOKEN_KEY } from '../../../constants/index';
import { BASE_API_URL } from '../../../constants/env-vars';

interface ApiKey {
  id: string;
  name: string;
  api_key: string;
  created: string;
  lastUsed: string | null;
  revoked: boolean;
  key_type: string;
}

type Environment = "test" | "production";

export default function ApiKeys() {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [environment, setEnvironment] = useState<Environment>("production");
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<ApiKey | null>(null);

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = typeof window !== "undefined" && localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const headers = buildHeaders();
        const res = await fetch(`${BASE_API_URL}/keys/`, {
          method: "POST",
          headers,
        });

        let payload: any;
        try {
          payload = await res.json();
        } catch {
          payload = await res.text();
        }

        let list: any[] = [];
        if (Array.isArray(payload)) {
          list = payload;
        } else if (payload.data && Array.isArray(payload.data)) {
          list = payload.data;
        } else if (payload.keys && Array.isArray(payload.keys)) {
          list = payload.keys;
        } else {
          list = [];
        }

        const mapped: ApiKey[] = list.map((raw: any) => ({
          id: raw.id,
          name: raw.name,
          api_key: raw.api_key,
          created: raw.created,
          lastUsed: raw.lastUsed ?? null,
          revoked: raw.revoked ?? false,
          key_type: raw.key_type ?? "",
        }));

        setApiKeys(mapped);
      } catch (err) {
        console.error("Error fetching API keys:", err);
        toast("Error", { description: "Failed to load API keys" });
        setApiKeys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast("Error", { description: "Please enter a name for your API key" });
      return;
    }

    setIsGenerating(true);
    setGeneratedKey(null);

    try {
      const headers = buildHeaders();
      const res = await fetch(`${BASE_API_URL}/keys/generate/${environment}/`, {
        method: "POST",
        headers,
        // 🔑 Here we send `key_name` instead of `name`
        body: JSON.stringify({ key_name: newKeyName.trim() }),
      });

      let payload: any;
      try {
        payload = await res.json();
      } catch {
        payload = await res.text();
      }

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Server responded with ${res.status}`);
      }

      const data = payload.data;
      const keyObj: ApiKey = {
        id: data.id,
        name: data.name,
        api_key: data.api_key,
        created: data.created,
        lastUsed: data.lastUsed ?? null,
        revoked: data.revoked ?? false,
        key_type: data.key_type ?? "",
      };

      setGeneratedKey(keyObj);
      setApiKeys((prev) => [keyObj, ...prev]);
      setNewKeyName("");
      toast("API Key Generated", { description: "Key created successfully" });
    } catch (err: any) {
      console.error("Generate API key error:", err);
      toast("Error", { description: err.message || "Failed to generate API key" });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const headers = buildHeaders();
      const res = await fetch(`${BASE_API_URL}/keys/delete/${keyId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
      toast("API Key Deleted", {
        description: "The API key has been permanently deleted.",
      });
    } catch (err: any) {
      console.error("Delete API key error:", err);
      toast("Error", { description: err.message || "Failed to delete API key" });
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const headers = buildHeaders();
      const res = await fetch(`${BASE_API_URL}/keys/roll/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ key_id: keyId }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      setApiKeys((prev) =>
        prev.map((key) =>
          key.id === keyId ? { ...key, revoked: true } : key
        )
      );

      toast("API Key Revoked", {
        description: "The API key has been revoked successfully",
      });
    } catch (err) {
      console.error("Revoke API key error:", err);
      toast("Error", { description: "Failed to revoke API key" });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
      .then(() => toast("Copied", { description: "API key copied to clipboard" }))
      .catch(() => toast("Error", { description: "Failed to copy API key" }));
  };

  const maskApiKey = (key: string | undefined) => {
    if (!key) return "";
    if (key.length <= 20) return key;
    return key.substring(0, 12) + "..." + key.substring(key.length - 8);
  };

  return (
    <DashboardLayout title="API Keys">
      <Alert className="mb-8 bg-white/5 border-white/10">
        <Key className="h-4 w-4" />
        <AlertDescription className="text-white/70">
          API keys allow you to authenticate requests to Label X services. Keep
          your keys secure and never share them publicly.
        </AlertDescription>
      </Alert>

      {/* Generate New API Key */}
      <Card className="bg-white/5 border-white/10 p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Generate New API Key
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="keyName" className="text-white/80">
                Key Name
              </Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API, Development API"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="environment" className="text-white/80">
                Environment
              </Label>
              <select
                id="environment"
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as Environment)
                }
                className="bg-white/5 border-white/10 text-white mt-1 p-2 rounded"
              >
                <option value="test">Test</option>
                <option value="production">Production</option>
              </select>
            </div>
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

      {/* Display Generated Key */}
      {generatedKey && (
        <Card className="bg-white/5 border-white/10 mb-8">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Newly Generated Key
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Below is the response for the generated API key.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">Name</TableHead>
                <TableHead className="text-white/80">API Key</TableHead>
                <TableHead className="text-white/80">Created</TableHead>
                <TableHead className="text-white/80">Last Used</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white font-medium">
                  {generatedKey.name}
                </TableCell>

                <TableCell className="text-white/80 font-mono text-sm">
                  <div className="flex items-center space-x-2">
                    <span>{generatedKey.api_key}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedKey.api_key)}
                      className="h-6 w-6 p-0 text-white/60 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>

                <TableCell className="text-white/60">
                  {new Date(generatedKey.created).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-white/60">
                  {generatedKey.lastUsed
                    ? new Date(generatedKey.lastUsed).toLocaleDateString()
                    : "Never"}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      generatedKey.revoked
                        ? "bg-red-400/20 text-red-400"
                        : "bg-green-400/20 text-green-400"
                    }`}
                  >
                    {generatedKey.revoked ? "Revoked" : "Active"}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Display All API Keys */}
      <Card className="bg-white/5 border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Your API Keys</h2>
          <p className="text-white/60 text-sm mt-1">
            Manage your API keys for accessing Label X services
          </p>
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
              {apiKeys.map((key) => (
                <TableRow key={key.id} className="border-white/10 hover:bg-white/5">
                  {/* Name */}
                  <TableCell className="text-white font-medium">{key.name}</TableCell>

                  {/* API Key */}
                  <TableCell className="text-white/80 font-mono text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{showKeys[key.id] ? key.api_key : maskApiKey(key.api_key)}</span>
                      <button onClick={() => toggleKeyVisibility(key.id)}>
                        {showKeys[key.id] ? (
                          <EyeOff className="w-4 h-4 text-white/50" />
                        ) : (
                          <Eye className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                      <button onClick={() => copyToClipboard(key.api_key)}>
                        <Copy className="w-4 h-4 text-white/50" />
                      </button>
                    </div>
                  </TableCell>

                  {/* Created */}
                  <TableCell className="text-white/60">
                    {new Date(key.created).toLocaleDateString()}
                  </TableCell>

                  {/* Last Used */}
                  <TableCell className="text-white/60">{key.lastUsed || "Never"}</TableCell>

                  {/* Status */}
                  <TableCell className="text-white/60">
                    {key.revoked ? (
                      <span className="text-red-500">Revoked</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-white/60">
                    <div className="flex items-center gap-3">
                      {!key.revoked && (
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="hover:text-yellow-500 transition-colors"
                          aria-label="Revoke Key"
                        >
                          <Key className="w-4 h-4 text-yellow-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="hover:text-red-600 transition-colors"
                        aria-label="Delete Key"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
}
