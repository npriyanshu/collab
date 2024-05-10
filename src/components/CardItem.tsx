"use client";
import { Card, User } from "@/interfaces";
import { Draggable } from "@hello-pangea/dnd";
import React, { useState } from "react";
import CardModal from "./CardModal";
import Image from "next/image";

const CardItem = ({ card, index }: { card: Card; index: number }) => {
  const [isModal, setIsModal] = useState(false);
  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            onClick={() => setIsModal(true)}
            role="button"
            className="truncate py-2 px-3 text-sm rounded-md bg-white shadow-md"
          >
            {card.title}
            <div className="mt-3 flex justify-end gap-2">
              {card?.users?.map((user: User) => (
                <div className="" key={user.id}>
                  <Image
                  fill
                  src={user.image as string}
                  key={user?.id}
                  alt=""
                    className="h-7 w-7 rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Draggable>
      {isModal && (
        <CardModal id={card.id} isModal={isModal} setIsModal={setIsModal} />
      )}
    </>
  );
};

export default CardItem;
