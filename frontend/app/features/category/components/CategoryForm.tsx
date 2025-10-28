import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../categorySlice'
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../categoryApi'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export default function CategoryForm() {
  const dispatch = useDispatch()
  const { selectedCategory } = useSelector((state: any) => state.category)
  const [createCategory] = useCreateCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    if (selectedCategory) setFormData(selectedCategory)
  }, [selectedCategory])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      if (selectedCategory) {
        await updateCategory(formData).unwrap()
        toast.success('Category updated successfully!')
      } else {
        await createCategory(formData).unwrap()
        toast.success('Category created successfully!')
      }
      dispatch(closeModal())
    } catch (err) {
      toast.error('Failed to save category')
    }
  }

  return (
    <Dialog open onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
