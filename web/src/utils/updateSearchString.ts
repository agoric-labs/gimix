import qs from "query-string";

export const updateSearchString = (newParam: Partial<QueryParams>) =>
  `/?${qs.stringify(
    Object.assign(qs.parse(window.location.search), newParam)
  )}`;
