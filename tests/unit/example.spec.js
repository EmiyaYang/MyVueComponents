// import ProTable from "@/components/ProTable";
import HelloWorld from "@/components/HelloWorld";
import { shallowMount } from "@vue/test-utils";

// window is undefined, vue-test-utils needs to be run in a browser environment.
require("jsdom-global")();

describe("HelloWorld.vue", () => {
  it("test", () => {
    const msg = "test";

    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    });

    expect(wrapper.props().msg).toBe(msg);
  });
});

// describe("ProTable.vue", () => {
//   it("renders props.rowKey when passed", () => {
//     const key = "id";
//     const wrapper = shallowMount(ProTable, {
//       propsData: { rowKey: key }
//     });
//     expect(wrapper.props().key).toBe(key);
//   });
// });
