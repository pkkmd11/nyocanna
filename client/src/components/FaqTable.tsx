import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, HelpCircle, Plus, ArrowUpDown } from 'lucide-react';
import { FaqItem } from '@shared/schema';

interface FaqTableProps {
  faqItems: FaqItem[];
  isLoading: boolean;
  onEdit: (faqItem: FaqItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function FaqTable({ faqItems, isLoading, onEdit, onDelete, onAdd }: FaqTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort FAQ items by order field
  const sortedFaqItems = [...faqItems].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
  });

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = (id: string, question: string) => {
    if (confirm(`Are you sure you want to delete this FAQ?\n\n"${question}"\n\nThis action cannot be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">FAQ Management</h2>
        <Button onClick={onAdd} data-testid="button-add-faq">
          <Plus className="w-4 h-4 mr-2" />
          Add New FAQ
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Answer Preview
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                    onClick={toggleSort}
                    data-testid="header-order"
                  >
                    <div className="flex items-center gap-1">
                      Order
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <HelpCircle className="w-4 h-4 animate-spin" />
                        Loading FAQ items...
                      </div>
                    </td>
                  </tr>
                ) : sortedFaqItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <HelpCircle className="w-8 h-8 text-muted-foreground/50" />
                        <div>No FAQ items found.</div>
                        <div className="text-sm">Create your first FAQ item to get started.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedFaqItems.map((faqItem, index) => {
                    const questionEn = (faqItem.question as any)?.en || 'Question';
                    const questionMy = (faqItem.question as any)?.my || '';
                    const answerEn = (faqItem.answer as any)?.en || '';
                    const answerMy = (faqItem.answer as any)?.my || '';
                    
                    // Create preview of answer (first 100 characters)
                    const answerPreview = answerEn.length > 100 
                      ? answerEn.substring(0, 100) + '...' 
                      : answerEn;
                    
                    return (
                      <tr key={faqItem.id} data-testid={`row-faq-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-foreground line-clamp-2" data-testid={`text-question-en-${index}`}>
                              {questionEn}
                            </div>
                            <div className="text-sm text-muted-foreground font-myanmar line-clamp-1 mt-1" data-testid={`text-question-my-${index}`}>
                              {questionMy}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-answer-preview-${index}`}>
                              {answerPreview}
                            </div>
                            {answerMy && (
                              <div className="text-sm text-muted-foreground/80 font-myanmar line-clamp-2 mt-1" data-testid={`text-answer-my-${index}`}>
                                {answerMy.length > 100 ? answerMy.substring(0, 100) + '...' : answerMy}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" data-testid={`badge-order-${index}`}>
                            {faqItem.order || 0}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={faqItem.isActive ? 'default' : 'secondary'}
                            data-testid={`badge-status-${index}`}
                          >
                            {faqItem.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(faqItem)}
                              data-testid={`button-edit-${index}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(faqItem.id, questionEn)}
                              data-testid={`button-delete-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}