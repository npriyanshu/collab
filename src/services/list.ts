"use server";
import { getAuthSession } from "@/lib/auth";
import { prismaDB } from "@/providers/connection";
import { createAudLog } from "./audit";
import { ACTION, TABLE_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createLists = async (data: { title: string; boardId: string }) => {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: "user not found",
    };
  }
  const { title, boardId } = data;
  let list;
  try {
    const lastList = await prismaDB.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const newOrder = lastList ? lastList?.order + 1 : 1;
    list = await prismaDB.list.create({
      data: {
        title,
        boardId,
        order: newOrder,
      },
    });
    console.log(list, "lastList");
    await createAudLog({
      tableId: list.id,
      tableTitle: list.title,
      tableType: TABLE_TYPE.LIST,
      action: ACTION.CREATE,
      orgId: "",
    });
  } catch (error) {
    return {
      error: "failed to create",
    };
  }
  revalidatePath("/");
  return { result: list };
};

// update list

export const updateList = async (data: {
  title: string;
  boardId: string;
  id: string;
}) => {
  const { title, id, boardId } = data;
  let list;

  try {
    list = await prismaDB.list.update({
      where: {
        id,
        boardId,
      },
      data: {
        title,
      },
    });

    await createAudLog({
      tableId: list.id,
      tableTitle: list.title,
      tableType: TABLE_TYPE.LIST,
      action: ACTION.UPDATE,
      orgId: "",
    });
  } catch (error) {
    return {
      error: "Not updated",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { result: list };
};

// copy list

export const listCopy = async (data: { id: string; boardId: string }) => {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: "user not found",
    };
  }
  const { id, boardId } = data;
  let list;
  try {
    const listtoCopy = await prismaDB.list.findUnique({
      where: { id, boardId },
      include: {
        cards: true,
      },
    });

    if (!listtoCopy) {
      return {
        error: "list not found",
      };
    }

    const lastList = await prismaDB.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = lastList ? lastList.order + 1 : 1;

    const cardsData = listtoCopy?.cards?.map((card: any) => ({
      boardId: card.boardId, // Include boardId in each card data
      title: card?.title,
      description: card.description,
      order: card.order,
    })) || [];

    list = await prismaDB.list.create({
      data: {
        boardId: listtoCopy.boardId,
        title: `${listtoCopy?.title} - copy`,
        order,
        cards: {
          createMany: {
            data: cardsData,
          },
        },
      },
      include: {
        cards: true,
      },
    });

    await createAudLog({
      tableId: list.id,
      tableTitle: list.title,
      tableType: TABLE_TYPE.LIST,
      action: ACTION.CREATE,
      orgId: "",
    });
  } catch (error) {
    return {
      error: "failed to copy",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { result: list };
};

// delete list
export const listDelete = async (data: { id: string; boardId: string }) => {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: "user not found",
    };
  }
  const { id, boardId } = data;
  let list;
  try {
    list = await prismaDB.list.delete({
      where: { id, boardId },
    });

    await createAudLog({
      tableId: list.id,
      tableTitle: list.title,
      tableType: TABLE_TYPE.LIST,
      action: ACTION.DELETE,
      orgId: "",
    });
  } catch (error) {
    return {
      error: "failed to copy",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { result: list };
};

// reorder list
export const reorderList = async (data: { items: any; boardId: string }) => {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: "user not found",
    };
  }
  const { items, boardId } = data;
  let lists;
  try {
    const transaction = items.map((list: any) =>
      prismaDB.list.update({
        where: { id: list.id },
        data: {
          order: list.order,
        },
      })
    );
    lists = await prismaDB.$transaction(transaction);
  } catch (error) {
    return { error: "list not reordered" };
  }

  revalidatePath(`/board/${boardId}`);
  return { result: lists };
};
