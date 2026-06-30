  export const formatDate = (value?: string | Date) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString();
  };