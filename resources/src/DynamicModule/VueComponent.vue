<script>
const { useSlots, h, defineAsyncComponent, Suspense } = require('vue');

export default {
  name: "ModuleComponent",
  props: {
    name: {
      type: String,
      required: true
    },
    timeout: [String, Number],
    suspensible: Boolean
  },
  emits: ['fail'],
  setup(props, ctx) {
    const slots = useSlots();

    const Component = defineAsyncComponent(() => {
      return new Promise((resolve, reject) => {
          mw.loader.using([props.name], function ( require ) {
            resolve(require(props.name));
          } ).catch((err) => {
            ctx.emit('fail')
            reject(err);
          });
      })
    });

    const suspenseSlots = { default: h(Component, ctx.attrs, slots) }

    if (slots.fallback) {
      suspenseSlots.fallback = slots.fallback();
    }

    return () => h(
        Suspense,
        { timeout: props.timeout, suspensible: props.suspensible },
        suspenseSlots
    );
  }
};
</script>
