from django.db import transaction
from rest_framework import serializers
from .models import Usuario, Categoria, Producto, Cliente, Pedido, DetallePedido


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'correo', 'cargo', 'estado', 'fecha_creacion']


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'fecha_creacion']


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    inventario_bajo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'existencias',
            'estado', 'categoria', 'categoria_nombre', 'inventario_bajo',
            'fecha_creacion',
        ]


class ClienteSerializer(serializers.ModelSerializer):
    numero_pedidos = serializers.IntegerField(read_only=True)
    dinero_total_gastado = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre_completo', 'telefono', 'correo',
            'fecha_registro', 'numero_pedidos', 'dinero_total_gastado',
        ]


class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = DetallePedido
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['precio_unitario', 'subtotal']


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    numero_total_unidades = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente', 'cliente_nombre', 'metodo_pago', 'total',
            'estado', 'notas', 'fecha', 'detalles', 'numero_total_unidades',
        ]
        read_only_fields = ['total']

    def validate_detalles(self, value):
        if not value:
            raise serializers.ValidationError('El pedido debe incluir al menos un producto.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        pedido = Pedido.objects.create(**validated_data)

        for detalle in detalles_data:
            producto = detalle['producto']
            cantidad = detalle['cantidad']
            DetallePedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=producto.precio,
            )

        pedido.calcular_total()
        return pedido

    @transaction.atomic
    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if detalles_data is not None:
            instance.detalles.all().delete()
            for detalle in detalles_data:
                producto = detalle['producto']
                cantidad = detalle['cantidad']
                DetallePedido.objects.create(
                    pedido=instance,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=producto.precio,
                )
            instance.calcular_total()

        return instance