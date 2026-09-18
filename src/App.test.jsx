import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("zeigt die drei vorgegebenen Reisen", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("GitHub-AWS-Biztrips");
  for (const name of ["BT01", "BT02", "BT03"]) {
    expect(screen.getByRole("link", { name })).toBeVisible();
  }
});

test("filtert nach Februar und setzt den Filter wieder zurück", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.selectOptions(screen.getByLabelText("Filter by Month:"), "2");
  expect(screen.getByRole("link", { name: "BT01" })).toBeVisible();
  expect(screen.queryByRole("link", { name: "BT02" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "BT03" })).not.toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Filter by Month:"), "");
  expect(screen.getByRole("link", { name: "BT02" })).toBeVisible();
  expect(screen.getByRole("link", { name: "BT03" })).toBeVisible();
});

test("zeigt im Januar keine Reisen", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.selectOptions(screen.getByLabelText("Filter by Month:"), "1");
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Found 0 trip");
  expect(screen.queryByRole("link", { name: /^BT0/ })).not.toBeInTheDocument();
});
