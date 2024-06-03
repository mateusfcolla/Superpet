/* eslint-disable @next/next/no-img-element */
import { TfiLayoutSlider } from "react-icons/tfi";
import ImageModal, {
  submitAssociatedImagesProps,
} from "../admin/produtos/ImageModal";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { Image } from "../admin/galeria/ImageList";
import Cookies from "js-cookie";

interface associatedImagesProps {
  setImages?: (data: any[]) => void;
  setCheckedItems?: (data: any[]) => void;
  setInitialCheckedItems?: (data: any[]) => void;
}

export const getAssociatedSliderImages = async ({
  setImages,
  setCheckedItems,
  setInitialCheckedItems,
}: associatedImagesProps) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/slider_images?page_id=1&page_size=10`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (setCheckedItems && setInitialCheckedItems) {
        const ids = data.SliderImages.map((item: any) => item.image_id);

        setCheckedItems(ids);
        setInitialCheckedItems(ids);
      }

      if (setImages) {
        const images = await Promise.all(
          data.SliderImages.map(async (item: any) => {
            const imageResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${item.image_id}`,
              {
                method: "GET",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  //Authorization: `Bearer ${token}`,
                },
              }
            );

            if (imageResponse.ok) {
              return await imageResponse.json();
            } else {
              console.error(`Failed to fetch image with ID ${item.image_id}`);
              return null;
            }
          })
        );

        setImages(images.filter((image: any) => image !== null));
      }
    } else {
      console.error("Failed to fetch slider images");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function SliderWidget() {
  const [images, setImages] = useState<Image[]>([]);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [initialCheckedItems, setInitialCheckedItems] = useState<number[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(
    null
  );

  const token = Cookies.get("access_token");
  const updateImageOrder = async (updatedItems: any[]) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/slider_images/update_by_image_id`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ images: updatedItems }),
      }
    );

    if (!response.ok) {
      console.error("Failed to update image order");
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !document.getElementById("images") || !images)
      return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property of the images
    const updatedItems = items.map((item, index) => ({
      image_id: item.id,
      order: index,
    }));

    setImages && setImages(items);

    // Call updateImageOrder with the updated items
    updateImageOrder(updatedItems);
  };

  useEffect(() => {
    getAssociatedSliderImages({
      setImages,
      setCheckedItems,
      setInitialCheckedItems,
    });
  }, [setImages]);

  const imageDetails: submitAssociatedImagesProps = {
    checkedItems: checkedItems,
    images: images,
    initialCheckedItems: initialCheckedItems,
    setImages: setImages,
    setCheckedItems: setCheckedItems,
    setInitialCheckedItems: setInitialCheckedItems,
  };

  return (
    <div className={`wk-dashboard-widget`}>
      <div className='wk-dashboard-widget__header'>
        <h2 className=''>
          <TfiLayoutSlider />
          Slider
        </h2>
      </div>
      <div className='col-span-2 gap-5'>
        <div className=' flex w-full justify-between'>
          <h2 className='wk-form__row-title'>Imagens</h2>
          <ImageModal
            getAssociatedImages={getAssociatedSliderImages}
            setImages={setImages}
            getImages={images}
            imageProps={imageDetails}
            isSlider={true}
          />
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='images'>
            {(provided) => (
              <div
                id='images'
                className='wk-image-box'
                {...provided.droppableProps}
                ref={provided.innerRef}>
                {images &&
                  images.length > 0 &&
                  images
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={String(image.id)}
                        index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className='wk-image-list__item wk-image-list__item--box'
                            onClick={() => setSelectedResultIndex(index)}>
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                              alt={image.alt}
                              draggable='false'
                              className='wk-image-list__image'
                            />
                            <div className='wk-image-list__item-content-wrapper'>
                              <div>
                                <h4 className='image-title'>{image.name}</h4>
                                <h4 className='image-file-name'>
                                  {image.image_path.split("/").pop()}
                                </h4>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
