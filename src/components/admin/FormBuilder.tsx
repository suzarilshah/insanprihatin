'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface FormConfig {
  title: string
  description: string
  submitButtonText: string
  successMessage: string
  fields: FormField[]
}

interface FormBuilderProps {
  value: FormConfig
  onChange: (config: FormConfig) => void
}

const fieldTypes = [
  { value: 'text', label: 'Text', icon: 'Aa' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'phone', label: 'Phone', icon: '#' },
  { value: 'textarea', label: 'Long Text', icon: '...' },
  { value: 'select', label: 'Dropdown', icon: 'v' },
  { value: 'checkbox', label: 'Checkboxes', icon: '[]' },
  { value: 'radio', label: 'Radio', icon: 'O' },
  { value: 'date', label: 'Date', icon: 'D' },
  { value: 'number', label: 'Number', icon: '123' },
]

const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export default function FormBuilder({ value, onChange }: FormBuilderProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [showFieldPicker, setShowFieldPicker] = useState(false)

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: `New ${fieldTypes.find(f => f.value === type)?.label || 'Field'}`,
      placeholder: '',
      required: false,
      options: ['checkbox', 'radio', 'select'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    }
    onChange({
      ...value,
      fields: [...value.fields, newField],
    })
    setEditingFieldId(newField.id)
    setShowFieldPicker(false)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange({
      ...value,
      fields: value.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    })
  }

  const removeField = (fieldId: string) => {
    onChange({
      ...value,
      fields: value.fields.filter(field => field.id !== fieldId),
    })
    if (editingFieldId === fieldId) {
      setEditingFieldId(null)
    }
  }

  const duplicateField = (field: FormField) => {
    const newField = {
      ...field,
      id: generateId(),
      label: `${field.label} (Copy)`,
    }
    const fieldIndex = value.fields.findIndex(f => f.id === field.id)
    const newFields = [...value.fields]
    newFields.splice(fieldIndex + 1, 0, newField)
    onChange({ ...value, fields: newFields })
  }

  const handleReorder = (newOrder: FormField[]) => {
    onChange({ ...value, fields: newOrder })
  }

  return (
    <div className="space-y-6">
      {/* Form Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-medium text-foundation-charcoal mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Form Settings
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Form Title (optional)</label>
            <input
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              placeholder="e.g., RSVP Form"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Submit Button Text</label>
            <input
              type="text"
              value={value.submitButtonText}
              onChange={(e) => onChange({ ...value, submitButtonText: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              placeholder="Submit"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
            <input
              type="text"
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              placeholder="Brief instructions for the form"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Success Message</label>
            <input
              type="text"
              value={value.successMessage}
              onChange={(e) => onChange({ ...value, successMessage: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              placeholder="Thank you for your submission!"
            />
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foundation-charcoal flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Form Fields
          </h3>
          <span className="text-xs text-gray-400">{value.fields.length} field{value.fields.length !== 1 ? 's' : ''}</span>
        </div>

        {value.fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-4xl mb-2">+</div>
            <p className="text-gray-500 text-sm mb-4">No fields yet. Add your first field below.</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={value.fields}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {value.fields.map((field) => (
              <Reorder.Item
                key={field.id}
                value={field}
                className="cursor-move"
              >
                <motion.div
                  layout
                  className={`border rounded-xl transition-all ${
                    editingFieldId === field.id
                      ? 'border-teal-500 bg-teal-50/50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {/* Field Header */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foundation-charcoal">{field.label}</span>
                        {field.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{field.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateField(field)
                        }}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeField(field.id)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${editingFieldId === field.id ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field Editor */}
                  <AnimatePresence>
                    {editingFieldId === field.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-gray-200 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Field Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newType = e.target.value as FormField['type']
                                  const needsOptions = ['select', 'checkbox', 'radio'].includes(newType)
                                  updateField(field.id, {
                                    type: newType,
                                    options: needsOptions && !field.options ? ['Option 1', 'Option 2'] : needsOptions ? field.options : undefined,
                                  })
                                }}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                              >
                                {fieldTypes.map(type => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {!['checkbox', 'radio', 'select'].includes(field.type) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                placeholder="Placeholder text..."
                              />
                            </div>
                          )}

                          {/* Options for select, checkbox, radio */}
                          {['checkbox', 'radio', 'select'].includes(field.type) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Options</label>
                              <div className="space-y-2">
                                {(field.options || []).map((option, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(field.options || [])]
                                        newOptions[index] = e.target.value
                                        updateField(field.id, { options: newOptions })
                                      }}
                                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                    />
                                    <button
                                      onClick={() => {
                                        const newOptions = (field.options || []).filter((_, i) => i !== index)
                                        updateField(field.id, { options: newOptions })
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                                    updateField(field.id, { options: newOptions })
                                  }}
                                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                >
                                  + Add Option
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">Required field</span>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}

        {/* Add Field Button */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowFieldPicker(!showFieldPicker)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>

          <AnimatePresence>
            {showFieldPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-10 bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  {fieldTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => addField(type.value as FormField['type'])}
                      className="p-3 text-center rounded-lg hover:bg-teal-50 transition-colors group"
                    >
                      <div className="text-lg font-mono text-gray-400 group-hover:text-teal-600 mb-1">
                        {type.icon}
                      </div>
                      <div className="text-xs text-gray-600 group-hover:text-teal-700">
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Form Preview Info */}
      {value.fields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="text-amber-800 font-medium mb-1">How to embed this form</p>
              <p className="text-amber-700">
                After saving, use this placeholder in your content to embed the form:
              </p>
              <code className="block mt-2 px-3 py-2 bg-amber-100 rounded-lg text-amber-900 font-mono text-xs">
                {'{{form:your-form-slug}}'}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
