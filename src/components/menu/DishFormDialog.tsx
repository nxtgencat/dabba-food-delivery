import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Modal } from '../ui/Modal'
import type { Dish, Kitchen, MenuCategory } from '../../types'
import { useCatalog } from '../../hooks/useApp'
import { categoryOrder } from '../../data/demo'
import { formatINR } from '../../lib/format'

interface DishFields {
  kitchenId: string
  name: string
  description: string
  price: number
  category: MenuCategory
  cuisine: string
  diet: 'veg' | 'nonveg'
  image: string
  available: boolean
  prepMinutes: number
}

const sampleImages = [
  '/food/11.webp',
  '/food/45.webp',
  '/food/16.webp',
  '/food/23.webp',
  '/food/28.webp',
  '/food/37.webp',
]

export function DishFormDialog({
  open,
  onClose,
  kitchens,
  dish,
  defaultKitchen,
}: {
  open: boolean
  onClose: () => void
  kitchens: Kitchen[]
  dish?: Dish | null
  defaultKitchen?: string
}) {
  const { addDish, updateDish } = useCatalog()
  const [preview, setPreview] = useState(dish?.image ?? sampleImages[0])
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DishFields>({
    values: {
      kitchenId: dish?.kitchenId ?? defaultKitchen ?? kitchens[0]?.id ?? '',
      name: dish?.name ?? '',
      description: dish?.description ?? '',
      price: dish?.price ?? 299,
      category: dish?.category ?? 'Mains',
      cuisine: dish?.cuisine ?? 'Indian',
      diet: dish?.diet ?? 'veg',
      image: dish?.image ?? sampleImages[0],
      available: dish?.available ?? true,
      prepMinutes: dish?.prepMinutes ?? 20,
    },
    resetOptions: { keepDefaultValues: false },
  })

  const price = watch('price')
  const formImage = watch('image')

  const close = () => {
    reset()
    setPreview(dish?.image ?? sampleImages[0])
    onClose()
  }

  const onSubmit = async (values: DishFields) => {
    await new Promise((resolve) => window.setTimeout(resolve, 480))
    if (dish) {
      updateDish(dish.id, values)
      toast.success(`${values.name} updated on the menu.`)
    } else {
      addDish(values)
      toast.success(`${values.name} added to the menu.`)
    }
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={dish ? `Edit ${dish.name}` : 'Add a dish'}
      description={
        dish
          ? 'The change reaches the menu, the restaurant page and every new basket.'
          : 'A dish added here lives in this browser alongside the catalogue.'
      }
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" form="dish-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {isSubmitting ? 'Saving' : dish ? 'Save the dish' : 'Add the dish'}
          </button>
        </>
      }
    >
      <form id="dish-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="min-w-0 space-y-3.5">
          <div>
            <label htmlFor="dish-name" className="field-label">
              Dish name
            </label>
            <input
              id="dish-name"
              className="field"
              placeholder="Kolhapuri misal"
              aria-invalid={Boolean(errors.name)}
              {...register('name', {
                required: 'Give the dish a name.',
                minLength: { value: 3, message: 'Use at least three characters.' },
                maxLength: { value: 60, message: 'Keep it under 60 characters.' },
              })}
            />
            {errors.name ? (
              <p className="field-error" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="dish-description" className="field-label">
              One line on the menu
            </label>
            <textarea
              id="dish-description"
              rows={2}
              className="field"
              placeholder="Sprouted moth beans, farsan and a hot kanda lasun masala."
              aria-invalid={Boolean(errors.description)}
              {...register('description', {
                required: 'Say what the dish is.',
                minLength: { value: 8, message: 'A little more detail helps the customer.' },
                maxLength: { value: 160, message: 'Keep it to one line: under 160 characters.' },
              })}
            />
            {errors.description ? (
              <p className="field-error" role="alert">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dish-price" className="field-label">
                Price, ₹
              </label>
              <input
                id="dish-price"
                type="number"
                inputMode="numeric"
                min={29}
                max={2400}
                step={10}
                className="field num"
                aria-invalid={Boolean(errors.price)}
                {...register('price', {
                  required: 'Set a price.',
                  valueAsNumber: true,
                  min: { value: 29, message: 'The lowest menu price is ₹29.' },
                  max: { value: 2400, message: 'The highest menu price is ₹2,400.' },
                })}
              />
              {errors.price ? (
                <p className="field-error" role="alert">
                  {errors.price.message}
                </p>
              ) : (
                <p className="mt-1 text-[13px] leading-4 text-faint">
                  Reads as {formatINR(Number.isFinite(price) ? price : 0)} on the menu.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="dish-prep" className="field-label">
                Prep, minutes
              </label>
              <input
                id="dish-prep"
                type="number"
                inputMode="numeric"
                min={5}
                max={90}
                className="field num"
                aria-invalid={Boolean(errors.prepMinutes)}
                {...register('prepMinutes', {
                  valueAsNumber: true,
                  required: 'Set the prep time.',
                  min: { value: 5, message: 'At least 5 minutes.' },
                  max: { value: 90, message: 'Under 90 minutes.' },
                })}
              />
              {errors.prepMinutes ? (
                <p className="field-error" role="alert">
                  {errors.prepMinutes.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dish-kitchen" className="field-label">
                Kitchen
              </label>
              <select
                id="dish-kitchen"
                className="field"
                {...register('kitchenId', { required: 'Choose the kitchen that cooks it.' })}
              >
                {kitchens.map((kitchen) => (
                  <option key={kitchen.id} value={kitchen.id}>
                    {kitchen.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dish-category" className="field-label">
                Course
              </label>
              <select id="dish-category" className="field" {...register('category')}>
                {categoryOrder.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dish-cuisine" className="field-label">
                Cuisine
              </label>
              <input
                id="dish-cuisine"
                className="field"
                placeholder="Maharashtrian"
                aria-invalid={Boolean(errors.cuisine)}
                {...register('cuisine', { required: 'Name the cuisine.' })}
              />
              {errors.cuisine ? (
                <p className="field-error" role="alert">
                  {errors.cuisine.message}
                </p>
              ) : null}
            </div>
            <fieldset>
              <legend className="field-label">Serve as</legend>
              <div className="flex h-10 items-center gap-4">
                <label className="flex cursor-pointer items-center gap-1.5 text-[13px]">
                  <input type="radio" value="veg" className="accent-[var(--color-ink)]" {...register('diet')} />
                  Vegetarian
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-[13px]">
                  <input
                    type="radio"
                    value="nonveg"
                    className="accent-[var(--color-ink)]"
                    {...register('diet')}
                  />
                  Non-veg
                </label>
              </div>
            </fieldset>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[13px] leading-4 text-muted">
            <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--color-ink)]" {...register('available')} />
            On sale from tonight
          </label>
        </div>

        <div className="min-w-0">
          <p className="field-label">Photograph</p>
          <div className="aspect-[4/3] overflow-hidden rounded-[6px] bg-sunken">
            <img
              src={formImage || preview}
              alt=""
              className="h-full w-full object-cover"
              width={240}
              height={180}
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {sampleImages.map((entry) => (
              <label
                key={entry}
                className="cursor-pointer overflow-hidden rounded-[4px] ring-1 ring-line has-[:checked]:ring-2 has-[:checked]:ring-ink"
              >
                <input
                  type="radio"
                  value={entry}
                  className="sr-only"
                  {...register('image', {
                    onChange: (event) => setPreview(event.target.value),
                  })}
                />
                <img src={entry} alt="" className="h-12 w-full object-cover" loading="lazy" />
              </label>
            ))}
          </div>
          <label htmlFor="dish-image" className="field-label mt-3">
            Or an image URL
          </label>
          <input
            id="dish-image"
            className="field text-[13px]"
            placeholder="https://…"
            {...register('image', {
              onChange: (event) => setPreview(event.target.value),
            })}
          />
          <p className="mt-1.5 text-[13px] leading-4 text-faint">
            The photographs offered are from the bundled DummyJSON set.
          </p>
        </div>
      </form>
    </Modal>
  )
}
