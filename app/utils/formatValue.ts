function formatValue(value: string): string {
    if (!value || value === "-" || value === "") return "-";
    const cleaned = value.replace(/,/g, "").replace(/\s/g, "");
    const num = parseFloat(cleaned);
    if (!isNaN(num) && cleaned.match(/^-?\d+\.?\d*$/)) {
      if (Math.abs(num) >= 1e12) 
            return (num / 1e12).toFixed(2) + "T";
      if (Math.abs(num) >= 1e9) 
            return (num / 1e9).toFixed(2) + "B";
      if (Math.abs(num) >= 1e6) 
            return (num / 1e6).toFixed(2) + "M";
      return num.toLocaleString("id-ID");
    }
    return value;
};