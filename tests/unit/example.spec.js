import ProTable from "../../dist/ProTable";
import { shallowMount } from "@vue/test-utils";

describe("ProTable.vue", () => {
  it("renders props.rowKey when passed", () => {
    const key = "new message";
    const wrapper = shallowMount(ProTable, {
      propsData: { rowKey: "key" }
    });
    expect(wrapper.text()).toMatch(key);
  });
});
