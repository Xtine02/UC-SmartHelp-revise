import { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Search, CheckCircle2 } from "lucide-react";

interface FAQ {
  faq_id: number;
  question: string;
  answer: string;
  created_at?: string;
}

const FAQManagement = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [createSubmitted, setCreateSubmitted] = useState(false);
  const [editSubmitted, setEditSubmitted] = useState(false);

  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
  });

  const [editFAQ, setEditFAQ] = useState({
    question: "",
    answer: "",
  });

  const fetchFAQs = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      console.log("Fetching FAQs from:", `${API_URL}/api/faqs`);
      
      const response = await fetch(`${API_URL}/api/faqs`);
      console.log("Fetch response status:", response.status);
      console.log("Fetch response ok:", response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log("FAQs fetched successfully:", data);
        setFaqs(data);
      } else {
        const errorText = await response.text();
        console.error("Fetch error response:", errorText);
        console.error("Fetch status:", response.status);
        
        toast({
          title: "Error",
          description: `Failed to fetch FAQs (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error fetching FAQs:", error);
      toast({
        title: "Error",
        description: "Network error - please check connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  useEffect(() => {
    if (createDialogOpen) {
      setCreateSubmitted(false);
      setNewFAQ({
        question: "",
        answer: "",
      });
    }
  }, [createDialogOpen]);

  useEffect(() => {
    if (editDialogOpen) {
      setEditSubmitted(false);
    }
  }, [editDialogOpen]);

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    // Validate form data
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      setCreateLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      // Prepare data according to database schema
      const faqData = {
        question: newFAQ.question.trim(),
        answer: newFAQ.answer.trim()
      };

      console.log("Creating FAQ with data:", faqData);
      console.log("API URL:", `${API_URL}/api/faqs`);

      const response = await fetch(`${API_URL}/api/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faqData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("FAQ created successfully:", result);
        toast({
          title: "Success",
          description: "FAQ created successfully",
        });
        setCreateSubmitted(true);
        fetchFAQs();
      } else {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        console.error("Response status:", response.status);
        
        let errorMessage = "Failed to create FAQ";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network/Client Error creating FAQ:", error);
      toast({
        title: "Error",
        description: "Network error - please check connection",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFAQ) return;

    setEditLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/faqs/${selectedFAQ.faq_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFAQ),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "FAQ updated successfully",
        });
        setEditSubmitted(true);
        fetchFAQs();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update FAQ",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to update FAQ",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteFAQ = async (faq_id: number) => {
    setDeleteLoading(faq_id);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/faqs/${faq_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "FAQ deleted successfully",
        });
        fetchFAQs();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete FAQ",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setEditFAQ({
      question: faq.question,
      answer: faq.answer,
    });
    setEditDialogOpen(true);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const fallbackFAQs = faqs.filter((faq) => {
    const matchesSearch = !filteredFAQs.find((filteredFAQ) => filteredFAQ.faq_id === faq.faq_id) &&
                         (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">FAQ Management</h2>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            {createSubmitted ? (
              <div className="relative p-12 text-center space-y-6 bg-background">
                <div className="flex justify-center">
                  <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600 animate-bounce" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-wide">FAQ Created Successfully!</h2>
              </div>
            ) : (
              <>
                <div className="bg-primary p-8 text-white relative">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase tracking-wide">New FAQ</DialogTitle>
                    <p className="text-primary-foreground/80 font-medium tracking-wider">Add a new frequently asked question to the knowledge base.</p>
                  </DialogHeader>
                </div>
                <div className="p-8 space-y-6 bg-background">
                  <form onSubmit={handleCreateFAQ} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Question</Label>
                        <Input
                          value={newFAQ.question}
                          onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                          placeholder="Enter the question..."
                          required
                          className="h-12 rounded-xl border-2 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Answer</Label>
                        <Textarea
                          value={newFAQ.answer}
                          onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                          placeholder="Enter answer..."
                          rows={4}
                          required
                          className="min-h-[120px] rounded-2xl border-2 resize-none shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                        className="flex-1 py-6 text-lg font-semibold rounded-2xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createLoading || !newFAQ.question.trim() || !newFAQ.answer.trim()}
                        className="flex-1 py-6 text-lg font-black rounded-2xl shadow-xl uc-gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createLoading ? "CREATING..." : "CREATE FAQ"}
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFAQs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No FAQs found
                </TableCell>
              </TableRow>
            ) : (
              filteredFAQs.map((faq) => (
                <TableRow key={faq.faq_id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={faq.question}>
                      {faq.question}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={faq.answer}>
                      {faq.answer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(faq)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFAQ(faq.faq_id)}
                        disabled={deleteLoading === faq.faq_id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {editSubmitted ? (
            <div className="relative p-12 text-center space-y-6 bg-background">
              <div className="flex justify-center">
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 animate-bounce" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-foreground uppercase tracking-wide">FAQ Updated Successfully!</h2>
            </div>
          ) : (
            <>
              <div className="bg-primary p-8 text-white relative">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase tracking-wide">Edit FAQ</DialogTitle>
                  <p className="text-primary-foreground/80 font-medium tracking-wider">Update the frequently asked question.</p>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6 bg-background">
                <form onSubmit={handleEditFAQ} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Question</Label>
                      <Input
                        value={editFAQ.question}
                        onChange={(e) => setEditFAQ({ ...editFAQ, question: e.target.value })}
                        placeholder="Enter the question..."
                        required
                        className="h-12 rounded-xl border-2 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Answer</Label>
                      <Textarea
                        value={editFAQ.answer}
                        onChange={(e) => setEditFAQ({ ...editFAQ, answer: e.target.value })}
                        placeholder="Enter the answer..."
                        rows={4}
                        required
                        className="min-h-[120px] rounded-2xl border-2 resize-none shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      className="flex-1 py-6 text-lg font-semibold rounded-2xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={editLoading || !editFAQ.question.trim() || !editFAQ.answer.trim()}
                      className="flex-1 py-6 text-lg font-black rounded-2xl shadow-xl uc-gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editLoading ? "UPDATING..." : "UPDATE FAQ"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManagement;
